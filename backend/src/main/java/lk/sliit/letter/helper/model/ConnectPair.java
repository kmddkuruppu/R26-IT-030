package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "connect_pairs")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ConnectPair {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connect_set_id", nullable = false)
    private ConnectSet connectSet;

    @Column(nullable = false, columnDefinition = "VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String leftText;

    @Column(nullable = false, columnDefinition = "VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String rightText;

    @Column(nullable = false, length = 100)
    private String leftMeaning;

    @Column(nullable = false, length = 100)
    private String rightMeaning;

    @Column(nullable = false)
    private Integer sortOrder;
}