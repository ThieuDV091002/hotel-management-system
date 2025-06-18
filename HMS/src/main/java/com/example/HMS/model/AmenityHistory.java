package com.example.HMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "amenity_histories")
public class AmenityHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "amenity_id", nullable = false)
    private Amenity amenity;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private AmenityAction action;

    @ManyToOne
    @JoinColumn(name = "source_room_id")
    private Room sourceRoom;

    @ManyToOne
    @JoinColumn(name = "destination_room_id")
    private Room destinationRoom;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "timestamp", nullable = false)
    private java.time.LocalDateTime timestamp;
}
