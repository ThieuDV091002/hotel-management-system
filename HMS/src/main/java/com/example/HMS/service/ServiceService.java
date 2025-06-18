package com.example.HMS.service;

import com.example.HMS.dto.ServiceDTO;
import org.springframework.data.domain.Page;

public interface ServiceService {
    ServiceDTO createService(ServiceDTO serviceDTO);
    ServiceDTO updateService(Long id, ServiceDTO serviceDTO);
    void deleteService(Long id);
    ServiceDTO getServiceById(Long id);
    Page<ServiceDTO> getServices(String serviceName, String serviceType, int page);
}
