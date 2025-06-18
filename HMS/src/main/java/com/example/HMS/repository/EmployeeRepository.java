package com.example.HMS.repository;

import com.example.HMS.model.Employee;
import com.example.HMS.model.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByUsername(String username);
    @Query("SELECT e FROM Employee e WHERE e.position IN :positions AND e.isActive = true")
    List<Employee> findByPositionInAndIsActiveTrue(@Param("positions") List<String> positions);

    @Query("SELECT e FROM Employee e WHERE e.fullName LIKE %:fullName%")
    Page<Employee> findByFullNameContaining(@Param("fullName") String fullName, Pageable pageable);

    @Query("SELECT e FROM Employee e WHERE e.position = :position")
    List<Employee> findByPosition(@Param("position") String position);

    List<Employee> findByRole(Role role);
}
