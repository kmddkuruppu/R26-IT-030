package lk.sliit.letter.helper.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Set;

/** Allows only the original, byte-for-byte files provided in Sinhala Letters.zip. */
@Service
public class ApprovedLetterImageService {
    private static final Set<String> APPROVED_SHA256 = Set.of(
            "037bb20dcf759b077b061ef710dc5e15ac906f297950610f772fe788eefda700",
            "0b724e922392116c23eacca943ea0c4ba4fc2ea3ba4f9a6c092b5fc5f02da709",
            "19cb5ec9ffaed25d0eed71a03d14c2601793a80aa348d7ffd18f8c30012d58e3",
            "1f2e9650ec17481ad80562bffa1ee040bf9a486a5bc17d183488c9b59bbd45ec",
            "2291ab7d0911d289c53d1b98dade041384b85ef4190c7cd56e4e85ec1168050b",
            "25d102215f1f5b9a3a09a93c6241df078c141798b30f94803b2e1cfe32a57810",
            "2b7f1f86256c14ad9cd6917b398fc7e4af9ffc28185caefb28a3bab1fe8965ea",
            "3307b6ba8fc33f57f12e7f085cc86cab88d85953ea3d67145710cb467dfc5f52",
            "42c68379998eeae28fb9f46d78df63d084ba1695ea731b2e8c1925793c62d689",
            "4a70c51eb9e0d948cdda43bc25db0d95213866604a74a8ac8f5bd92907af3cba",
            "58d1daa846399acc484e47a7468dfab432ee22df6e511c894e12c041d5d8eb87",
            "5bd3aa4ac8cbc8cdfe86e60bc03ad22eb3189d6ff9a2b0eb31f23291886816b0",
            "68cd4abf5bbb734b66ff301968ac8bba415d3a4d10f5042b574a122605ebaf7e",
            "6efd1b6e96138fbcc10fe7ee274d5dccc7193b6ae19b8c0e999cc7971ec495e5",
            "748168fd6130049d5199d15d7f55f16907bb8574cbea33e92a81853cf4bbfd0f",
            "7549f518b96010271399e83092c574208fa991596b8753a2f903c5df4028bfbb",
            "7ffa6e23f5a9263477b100fc7773aa7200ad6e35e57ea0246a6614e37c00784a",
            "83db25352c2ab95680fc8b2c815030e31e67dc65947531b8bb2aafc04c00a9de",
            "84d8191aa1260dfc1a6661ecfdab01bdd2011c7fdd77dd869e5bdf53bb1cd05a",
            "956db54ba77690309321ccb3c7e0d369a535112d28d13ef6c2f0be56abe6ee9c",
            "99782d2d2e4c6d4c13f317945dfdfaf5034b875a2a78421a8b7225df2be3fb44",
            "9b7d334648ca23f7d67a67ec8a4ae4022eb164ea4a1aa6ef0ad96bca7ed3458b",
            "9d85e55ba11e89284067062d17be34a828cc6aae463f7006e06d1a18bae8aefe",
            "b07088755301c2f4832f65cce656bc7fe9dfe462b3381d7a5e73adb0498c56a8",
            "b947a71bc66beceac9b90fd9ec926d1906b1fc3985e43905efb66ae38123a30b",
            "bb9b3913896c050ed041da6a5e38840b64245871833100104fb053ac2f323d4d",
            "c134a612eb259505684b165e09e947dd2b0d56be4f0de97e97232d71122d6445",
            "c6a17c9522622d714eefd1b3de84c48aafbaa967da388fecefa3c74ea0e79e01",
            "c70e6d45ca03796424fe016846d594407f935f4885dad9bd9e214c9d9d94461f",
            "cef6ee90328a4604ee49a56997613a2c0afa5b9d761fe5a2f68ba68c7a0c928d",
            "d80ea60515967e172ccc98d61479d3af5888f5060bb39c3f02f51cfb56c58e0f",
            "dc398cbc1623b55df1ad986c2eb2168c541ea4c4f949ade6f9b7dd8f18dc388a",
            "ed4fc9dbe3764490ed2d76acbe4d0a2b1257e906708a84d6e6ce57e815dc389a",
            "f3734d2b7c41f42c7811333715beef61ea66db53577df0a11a07e6efefda8192",
            "faab579f3f9d22c2a62f0eac38857befbc46a3e6dee7f022aec748d804ae9430",
            "fb2f8ef641c0c35ec9b1cc7d86f76d0987f32a31be9e7dc50802cc6991a05d43"
    );

    public boolean isApproved(MultipartFile image) throws java.io.IOException {
        if (image == null || image.isEmpty()) return false;
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(image.getBytes());
            return APPROVED_SHA256.contains(HexFormat.of().formatHex(digest));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
