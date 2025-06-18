package com.example.HMS.service;

import com.example.HMS.dto.ServiceUsageDTO;
import com.example.HMS.model.Bookings;
import com.example.HMS.model.ServiceUsage;
import com.example.HMS.model.Services;
import com.example.HMS.repository.BookingsRepository;
import com.example.HMS.repository.ServiceRepository;
import com.example.HMS.repository.ServiceUsageRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ServiceUsageServiceImpl implements ServiceUsageService{
    private final BookingsRepository bookingsRepository;
    private final ServiceRepository serviceRepository;
    private final ServiceUsageRepository serviceUsageRepository;

    @Override
    @Transactional
    public ServiceUsageDTO createServiceUsage(Long bookingId, ServiceUsageDTO serviceUsageDTO) {
        Bookings booking = bookingsRepository.findById(Math.toIntExact(bookingId))
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Services service = serviceRepository.findById(serviceUsageDTO.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));

        // Validate totalPrice
        double expectedTotalPrice = serviceUsageDTO.getQuantity() * service.getServicePrice();
        if (Math.abs(serviceUsageDTO.getTotalPrice() - expectedTotalPrice) > 0.01) {
            throw new RuntimeException("Invalid total price. Expected: " + expectedTotalPrice);
        }

        ServiceUsage serviceUsage = new ServiceUsage();
        serviceUsage.setBookings(booking);
        serviceUsage.setServices(service);
        serviceUsage.setQuantity(serviceUsageDTO.getQuantity());
        serviceUsage.setTotalPrice(serviceUsageDTO.getTotalPrice());
        serviceUsage.setTimestamp(LocalDateTime.now());

        serviceUsage = serviceUsageRepository.save(serviceUsage);
        return convertToDTO(serviceUsage);
    }

    @Override
    @Transactional
    public ServiceUsageDTO updateServiceUsage(Long bookingId, Long id, ServiceUsageDTO serviceUsageDTO) {
        ServiceUsage serviceUsage = serviceUsageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service usage not found"));

        if (!serviceUsage.getBookings().getId().equals(bookingId)) {
            throw new RuntimeException("Service usage does not belong to the specified booking");
        }

        Services service = serviceRepository.findById(serviceUsageDTO.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));

        // Validate totalPrice
        double expectedTotalPrice = serviceUsageDTO.getQuantity() * service.getServicePrice();
        if (Math.abs(serviceUsageDTO.getTotalPrice() - expectedTotalPrice) > 0.01) {
            throw new RuntimeException("Invalid total price. Expected: " + expectedTotalPrice);
        }

        serviceUsage.setServices(service);
        serviceUsage.setQuantity(serviceUsageDTO.getQuantity());
        serviceUsage.setTotalPrice(serviceUsageDTO.getTotalPrice());
        serviceUsage.setTimestamp(LocalDateTime.now());

        serviceUsage = serviceUsageRepository.save(serviceUsage);
        return convertToDTO(serviceUsage);
    }

    @Override
    @Transactional
    public void deleteServiceUsage(Long bookingId, Long id) {
        ServiceUsage serviceUsage = serviceUsageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service usage not found"));

        if (!serviceUsage.getBookings().getId().equals(bookingId)) {
            throw new RuntimeException("Service usage does not belong to the specified booking");
        }

        serviceUsageRepository.deleteById(id);
    }

    private ServiceUsageDTO convertToDTO(ServiceUsage serviceUsage) {
        ServiceUsageDTO dto = new ServiceUsageDTO();
        dto.setId(serviceUsage.getId());
        dto.setServiceId(serviceUsage.getServices().getId());
        dto.setServiceName(serviceUsage.getServices().getServiceName());
        dto.setQuantity(serviceUsage.getQuantity());
        dto.setTotalPrice(serviceUsage.getTotalPrice());
        dto.setTimestamp(serviceUsage.getTimestamp());
        return dto;
    }
}
