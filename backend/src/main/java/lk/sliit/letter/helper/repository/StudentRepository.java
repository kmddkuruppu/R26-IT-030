package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUsername(String username);
    boolean existsByUsername(String username);

    Optional<Student> findByEmail(String email);
}