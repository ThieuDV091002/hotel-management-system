package com.example.HMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomName;

    private String description;

    private String image;

    private String price;

    private Integer capacity;

    @Enumerated(EnumType.STRING)
    private RoomType roomType;

    @Enumerated(EnumType.STRING)
    private RoomStatus roomStatus;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL)
    private List<RoomAmenity> roomAmenities;

    @OneToMany(mappedBy = "sourceRoom", cascade = CascadeType.ALL)
    private List<AmenityHistory> sentAmenityHistories;

    @OneToMany(mappedBy = "destinationRoom", cascade = CascadeType.ALL)
    private List<AmenityHistory> receivedAmenityHistories;

    @Transient
    public String getPhotosImagePath() {
        if (id == null || image == null) return null;

        return "/room-photos/" + id + "/" + image;
    }
}
