package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.ConnectPair;
import lk.sliit.letter.helper.model.ConnectSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConnectPairRepository extends JpaRepository<ConnectPair, Long> {
    List<ConnectPair> findByConnectSetOrderBySortOrderAsc(ConnectSet connectSet);
    void deleteByConnectSet(ConnectSet connectSet);
}