package com.example.HMS.repository;

import com.example.HMS.model.Feedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    @Query("SELECT f FROM Feedback f " +
            "WHERE (:customerName IS NULL OR f.customer.fullName LIKE CONCAT('%', :customerName, '%'))")
    Page<Feedback> findWithCustomerName(@Param("customerName") String customerName, Pageable pageable);
    Page<Feedback> findByCustomerId(Long customerId, Pageable pageable);
    Page<Feedback> findByBookingId(Long bookingId, Pageable pageable);
    Page<Feedback> findByRating(Integer rating, Pageable pageable);
    @Query("SELECT f FROM Feedback f " +
            "WHERE (:customerName IS NULL OR f.customer.fullName LIKE LOWER(CONCAT('%', :customerName, '%'))) " +
            "AND (:bookingId IS NULL OR f.booking.id = :bookingId) " +
            "AND (:rating IS NULL OR f.rating = :rating)")
    Page<Feedback> searchFeedback(@Param("customerName") String customerName,
                                  @Param("bookingId") Long bookingId,
                                  @Param("rating") Integer rating,
                                  Pageable pageable);
    List<Feedback> findTop15ByOrderByDateTimeDesc();
}
