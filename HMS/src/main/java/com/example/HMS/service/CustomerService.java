package com.example.HMS.service;

import com.example.HMS.dto.ChangePasswordDTO;
import com.example.HMS.dto.ResetPasswordDTO;
import com.example.HMS.dto.UpdateProfileDTO;
import com.example.HMS.dto.CustomerDTO;
import org.springframework.data.domain.Page;

public interface CustomerService {
    CustomerDTO updateCustomerActiveStatus(Long id, boolean isActive);
    void deleteCustomer(Long id);
    CustomerDTO getCustomerById(Long id);
    Page<CustomerDTO> getAllCustomers(String fullName, String email, String phoneNumber,
                                      Boolean isActive, int page, int size);
    CustomerDTO getCustomerProfile(String username);
    CustomerDTO updateCustomerProfile(String username, UpdateProfileDTO dto);
    void changePassword(String username, ChangePasswordDTO dto);
    void createPasswordResetToken(String email);
    void resetPassword(ResetPasswordDTO dto);
}
