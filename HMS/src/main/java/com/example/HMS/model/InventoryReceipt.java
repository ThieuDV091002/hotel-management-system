package com.example.HMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "inventory_receipts")
public class InventoryReceipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String receiptCode;

    @Column(nullable = false)
    private LocalDateTime receiptDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private double totalAmount;

    @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InventoryReceiptDetail> details = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (receiptDate == null) {
            receiptDate = LocalDateTime.now();
        }
        if (receiptCode == null) {
            receiptCode = "IR-" + System.currentTimeMillis();
        }
        if (status == null) {
            status = "PENDING";
        }
        calculateTotalAmount();
    }

    @PreUpdate
    protected void onUpdate() {
        calculateTotalAmount();
    }

    private void calculateTotalAmount() {
        this.totalAmount = details.stream()
                .mapToDouble(detail -> detail.getQuantity() * detail.getUnitPrice())
                .sum();
    }
}
