package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "connect_sets")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ConnectSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String title;

//    @Column(nullable = false, length = 200)
//    private String hint;

    @Column(nullable = false)
    private Integer sortOrder;

    @OneToMany(mappedBy = "connectSet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ConnectPair> pairs;
}