package com.example.HMS.utils;

import com.example.HMS.model.*;
import com.example.HMS.repository.CustomerRepository;
import com.example.HMS.repository.FolioRepository;
import com.example.HMS.repository.LoyaltyLevelRepository;
import com.example.HMS.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PaymentServiceFacade {

    private final PaymentFactory paymentFactory;
    private final FolioRepository folioRepository;
    private final CustomerRepository customerRepository;
    private final LoyaltyLevelRepository loyaltyLevelRepository;

    private final ConcurrentHashMap<String, Long> transactionToFolioMap = new ConcurrentHashMap<>();

    @Autowired
    public PaymentServiceFacade(PaymentFactory paymentFactory, FolioRepository folioRepository, CustomerRepository customerRepository, LoyaltyLevelRepository loyaltyLevelRepository) {
        this.paymentFactory = paymentFactory;
        this.folioRepository = folioRepository;
        this.customerRepository = customerRepository;
        this.loyaltyLevelRepository = loyaltyLevelRepository;
    }

    public String initiatePayment(Long folioId, String providerName) {
        Folio folio = folioRepository.findById(folioId)
                .orElseThrow(() -> new IllegalArgumentException("Folio not found: " + folioId));

        if (FolioStatus.PAID.equals(folio.getStatus())) {
            throw new IllegalStateException("Folio is already paid");
        }

        PaymentService paymentService = paymentFactory.getPaymentService(providerName);
        String paymentUrl = paymentService.createPayment(folio);

        String transactionId = generateTransactionId(folio, providerName);
        transactionToFolioMap.put(transactionId, folioId);

        return paymentUrl;
    }

    @Transactional
    public boolean verifyAndUpdatePayment(Long folioId, String providerName) {
        Folio folio = folioRepository.findById(folioId)
                .orElseThrow(() -> new IllegalArgumentException("Folio not found: " + folioId));

        if (FolioStatus.PAID.equals(folio.getStatus())) {
            return true;
        }

        PaymentService paymentService = paymentFactory.getPaymentService(providerName);
        String transactionId = generateTransactionId(folio, providerName);
        boolean success = paymentService.verifyPayment(transactionId);

        if (success) {
            updateFolioToPaid(folioId);
            transactionToFolioMap.remove(transactionId);
        }

        return success;
    }

    @Transactional
    public boolean verifyAndUpdatePaymentByTransaction(String transactionId, String providerName) {
        Long folioId = transactionToFolioMap.get(transactionId);
        if (folioId == null) {
            return false;
        }

        return verifyAndUpdatePayment(folioId, providerName);
    }

    private void updateFolioToPaid(Long folioId) {
        Folio folio = folioRepository.findById(folioId)
                .orElseThrow(() -> new IllegalArgumentException("Folio not found: " + folioId));

        folio.setStatus(FolioStatus.PAID);
        folio.setUpdatedAt(LocalDateTime.now());
        folioRepository.save(folio);

        User user = folio.getUser();
        if (user instanceof Customer) {
            Customer customer = (Customer) user;
            updateCustomerLoyaltyPoints(customer, folio.getTotalAmount());
        }
    }

    private void updateCustomerLoyaltyPoints(Customer customer, double amount) {
        double pointsToAdd = amount / 100.0;
        double currentPoints = customer.getLoyaltyPoints();
        double newTotalPoints = currentPoints + pointsToAdd;

        customer.setLoyaltyPoints(newTotalPoints);

        LoyaltyLevel currentLevel = customer.getLoyaltyLevel();
        LoyaltyLevel nextLevel = findNextLoyaltyLevel(currentLevel, newTotalPoints);

        if (nextLevel != null && !nextLevel.equals(currentLevel)) {
            customer.setLoyaltyLevel(nextLevel);
        }

        customerRepository.save(customer);
    }

    private LoyaltyLevel findNextLoyaltyLevel(LoyaltyLevel currentLevel, double totalPoints) {
        return loyaltyLevelRepository.findHighestLevelForPoints(totalPoints)
                .orElse(currentLevel);
    }

    private String generateTransactionId(Folio folio, String providerName) {
        if ("zalopay".equalsIgnoreCase(providerName)) {
            java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat("yyMMdd");
            String dateStr = formatter.format(new java.util.Date());
            return dateStr + "_2554_" + folio.getId();
        }
        return providerName.toUpperCase() + "_" + folio.getId() + "_" + System.currentTimeMillis();
    }
}
