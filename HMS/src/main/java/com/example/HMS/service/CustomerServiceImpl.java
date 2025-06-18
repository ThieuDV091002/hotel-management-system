package com.example.HMS.service;

import com.example.HMS.dto.ChangePasswordDTO;
import com.example.HMS.dto.ResetPasswordDTO;
import com.example.HMS.dto.UpdateProfileDTO;
import com.example.HMS.dto.CustomerDTO;
import com.example.HMS.exception.ResourceNotFoundException;
import com.example.HMS.model.Customer;
import com.example.HMS.model.PasswordResetToken;
import com.example.HMS.model.Role;
import com.example.HMS.model.User;
import com.example.HMS.repository.PasswordResetTokenRepository;
import com.example.HMS.repository.TokenBlacklistRepository;
import com.example.HMS.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final JavaMailSender mailSender;

    @Override
    public CustomerDTO updateCustomerActiveStatus(Long id, boolean isActive) {
        Customer customer = userRepository.findById(id)
                .filter(user -> user instanceof Customer)
                .map(user -> (Customer) user)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        customer.setActive(isActive);
        Customer updatedCustomer = userRepository.save(customer);
        return modelMapper.map(updatedCustomer, CustomerDTO.class);
    }

    @Override
    public void deleteCustomer(Long id) {
        Customer customer = userRepository.findById(id)
                .filter(user -> user instanceof Customer)
                .map(user -> (Customer) user)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        userRepository.delete(customer);
    }

    @Override
    public CustomerDTO getCustomerById(Long id) {
        Customer customer = userRepository.findById(id)
                .filter(user -> user instanceof Customer)
                .map(user -> (Customer) user)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return modelMapper.map(customer, CustomerDTO.class);
    }

    @Override
    public Page<CustomerDTO> getAllCustomers(String fullName, String email, String phoneNumber,
                                             Boolean isActive, int page, int size) {
        Specification<User> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(root.get("role"), Role.CUSTOMER));

            if (fullName != null && !fullName.isEmpty()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("fullName")),
                        "%" + fullName.toLowerCase() + "%"));
            }

            if (email != null && !email.isEmpty()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("email")),
                        "%" + email.toLowerCase() + "%"));
            }

            if (phoneNumber != null && !phoneNumber.isEmpty()) {
                predicates.add(criteriaBuilder.like(root.get("phoneNumber"),
                        "%" + phoneNumber + "%"));
            }

            if (isActive != null) {
                predicates.add(criteriaBuilder.equal(root.get("isActive"), isActive));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Pageable pageable = PageRequest.of(page, size);
        Page<User> customersPage = userRepository.findAll(spec, pageable);
        return customersPage.map(user -> modelMapper.map(user, CustomerDTO.class));
    }

    @Override
    public CustomerDTO getCustomerProfile(String username) {
        Customer customer = userRepository.findByUsername(username)
                .filter(user -> user instanceof Customer)
                .map(user -> (Customer) user)
                .orElseThrow(() -> new UsernameNotFoundException("Customer not found with username: " + username));
        return modelMapper.map(customer, CustomerDTO.class);
    }

    @Override
    public CustomerDTO updateCustomerProfile(String username, UpdateProfileDTO dto) {
        Customer customer = userRepository.findByUsername(username)
                .filter(user -> user instanceof Customer)
                .map(user -> (Customer) user)
                .orElseThrow(() -> new UsernameNotFoundException("Customer not found with username: " + username));

        customer.setFullName(dto.getFullName());
        customer.setPhoneNumber(dto.getPhoneNumber());
        customer.setEmail(dto.getEmail());
        customer.setAddress(dto.getAddress());

        Customer updatedCustomer = userRepository.save(customer);
        return modelMapper.map(updatedCustomer, CustomerDTO.class);
    }

    @Override
    public void changePassword(String username, ChangePasswordDTO dto) {
        Customer customer = userRepository.findByUsername(username)
                .filter(user -> user instanceof Customer)
                .map(user -> (Customer) user)
                .orElseThrow(() -> new UsernameNotFoundException("Customer not found with username: " + username));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), customer.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirmation do not match");
        }

        customer.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(customer);
    }

    @Override
    public void createPasswordResetToken(String email) {
        Customer customer = userRepository.findByEmail(email)
                .filter(user -> user instanceof Customer)
                .map(user -> (Customer) user)
                .orElseThrow(() -> new UsernameNotFoundException("Customer not found with email: " + email));

        String token = UUID.randomUUID().toString();
        PasswordResetToken prt = new PasswordResetToken();
        prt.setToken(token);
        prt.setUser(customer);
        prt.setExpiryDate(LocalDateTime.now().plusHours(1));
        passwordResetTokenRepository.save(prt);

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(customer.getEmail());
        mail.setSubject("Password Reset Request");
        mail.setText("Click the following link to reset your password: " +
                "https://localhost:5173/reset-password?token=" + token);
        mailSender.send(mail);
    }

    @Override
    public void resetPassword(ResetPasswordDTO dto) {
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirmation do not match");
        }

        PasswordResetToken prt = passwordResetTokenRepository.findByToken(dto.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));

        if (prt.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reset token has expired");
        }

        Customer customer = (Customer) prt.getUser();
        customer.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(customer);
        passwordResetTokenRepository.delete(prt);
    }
}
