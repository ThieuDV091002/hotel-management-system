package com.example.HMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "assets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "asset_id")
    private Integer id;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "maintain_date")
    @Temporal(TemporalType.DATE)
    private Date maintainDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_condition", length = 20)
    private AssetCondition condition;
}
