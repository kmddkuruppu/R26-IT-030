package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false)
    private Integer grade;

    @Column(nullable = false)
    private String school;

    @Column(nullable = false)
    private String password; // BCrypt hashed
}