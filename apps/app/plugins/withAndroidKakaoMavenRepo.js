const { withProjectBuildGradle } = require('expo/config-plugins');

// com.kakao.sdk:* 아티팩트는 Google/Maven Central/JitPack이 아니라 카카오 자체
// Maven 저장소에만 있어서, 이 저장소가 등록돼 있지 않으면 :app 모듈의 의존성 해석이
// 실패한다 (kakao-login 모듈 자신의 build.gradle엔 이미 있지만, 루트 allprojects엔 없음).
const KAKAO_MAVEN_REPO =
  "maven { url 'https://devrepo.kakao.com/nexus/content/groups/public/' }";

const withAndroidKakaoMavenRepo = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes(KAKAO_MAVEN_REPO)) {
      config.modResults.contents = config.modResults.contents.replace(
        /allprojects\s*{\s*repositories\s*{/,
        (matched) => `${matched}\n    ${KAKAO_MAVEN_REPO}`,
      );
    }
    return config;
  });
};

module.exports = withAndroidKakaoMavenRepo;
