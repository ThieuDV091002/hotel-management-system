package com.example.HMS.service;

import com.example.HMS.dto.ServiceDTO;
import com.example.HMS.exception.ResourceNotFoundException;
import com.example.HMS.model.Services;
import com.example.HMS.repository.ServiceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ServiceServiceImpl implements ServiceService{
    private final ServiceRepository serviceRepository;

    @Override
    @Transactional
    public ServiceDTO createService(ServiceDTO serviceDTO) {
        Services service = new Services();
        service.setServiceName(serviceDTO.getServiceName());
        service.setServiceDescription(serviceDTO.getServiceDescription());
        service.setServicePrice(serviceDTO.getServicePrice());
        service.setServiceType(serviceDTO.getServiceType());

        service = serviceRepository.save(service);
        return convertToDTO(service);
    }

    @Override
    @Transactional
    public ServiceDTO updateService(Long id, ServiceDTO serviceDTO) {
        Services service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        service.setServiceName(serviceDTO.getServiceName());
        service.setServiceDescription(serviceDTO.getServiceDescription());
        service.setServicePrice(serviceDTO.getServicePrice());
        service.setServiceType(serviceDTO.getServiceType());

        service = serviceRepository.save(service);
        return convertToDTO(service);
    }

    @Override
    @Transactional
    public void deleteService(Long id) {
        if (!serviceRepository.existsById(id)) {
            throw new RuntimeException("Service not found");
        }
        serviceRepository.deleteById(id);
    }

    @Override
    public ServiceDTO getServiceById(Long id) {
        Services service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
        return convertToDTO(service);
    }

    @Override
    public Page<ServiceDTO> getServices(String serviceName, String serviceType, int page) {
        PageRequest pageRequest = PageRequest.of(page, 15);
        Page<Services> services;

        if (serviceName != null || serviceType != null) {
            services = serviceRepository.findByCriteria(serviceName, serviceType, pageRequest);
        } else {
            services = serviceRepository.findAll(pageRequest);
        }

        return services.map(this::convertToDTO);
    }

    private ServiceDTO convertToDTO(Services service) {
        ServiceDTO dto = new ServiceDTO();
        dto.setId(service.getId());
        dto.setServiceName(service.getServiceName());
        dto.setServiceDescription(service.getServiceDescription());
        dto.setServicePrice(service.getServicePrice());
        dto.setServiceType(service.getServiceType());
        return dto;
    }
}
