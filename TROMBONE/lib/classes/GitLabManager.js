import { fileURLToPath } from 'url';
import path from 'path';
import BaseManager from './BaseManager.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




class GitLabManager extends BaseManager {
  constructor(page) {
    super(page);
    this.page = page;
    this.randomBranchName = null; // 생성된 브랜치명 저장
  }

  // 새 탭에서 GitLab 파일 수정 (scenario-1.spec.js에서 사용)
  async modifyFileInGitLabInNewTab(browser, config, filePath, lineNumber, newContent, commitMessage = 'Auto-test: Update memberList.html') {
    let newPage = null;
    try {
      console.log('🚀 새 탭에서 GitLab 파일 수정 프로세스 시작...');
      
      // 1. 새 브라우저 탭 생성
      newPage = await browser.newPage();
      console.log('✅ 새 브라우저 탭 생성 완료');
      
      // 2. 새 탭에서 GitLab 로그인
      await this.loginToGitLabInNewTab(newPage, config);
      
      // 3. 특정 파일로 이동
      await this.navigateToFileInNewTab(newPage, filePath);
      
      // 4. 편집 모드 진입
      await this.enterEditModeInNewTab(newPage);
      
      // 5. 특정 줄 수정
      await this.editLineContentInNewTab(newPage, lineNumber, newContent);
      
                   // 6. 변경사항 커밋
      await this.commitChangesInNewTab(newPage, commitMessage);
      
      console.log('🎉 새 탭에서 GitLab 파일 수정 프로세스 완료!');
      
    } catch (error) {
      console.error('❌ 새 탭에서 GitLab 파일 수정 프로세스 실패:', error.message);
      throw error;
    } finally {
      // 7. 새 탭 정리
      if (newPage && !newPage.isClosed()) {
        console.log('🧹 새 탭 정리 중...');
        await newPage.close();
        console.log('✅ 새 탭 정리 완료');
      }
    }
  }

  // 새 탭에서 GitLab 로그인
  async loginToGitLabInNewTab(page, config) {
    try {
      console.log('🔐 새 탭에서 GitLab 로그인 시도 중...');
      
      // 직접 저장소 URL로 접속
      const repositoryUrl = `http://gitlab.tst.console.trombone.okestro.cloud/${config.project.code}/${config.project.code}-REPO`;
      await page.goto(repositoryUrl);
      
      // 로그인이 필요한 경우 로그인 페이지로 리다이렉트됨
      const currentUrl = page.url();
      
      if (currentUrl.includes('/users/sign_in')) {
        await page.getByTestId('username-field').click()
        await page.getByTestId('username-field').fill(`${config.gitlab.username}`);
        await page.getByTestId('password-field').click();
        await page.getByTestId('password-field').fill(`${config.gitlab.password}`);
        await page.getByTestId('sign-in-button').click();

        // 로그인 후 저장소 페이지로 리다이렉트 대기
        await page.waitForURL(repositoryUrl);
        await page.waitForTimeout(1000);
        // 랜덤 브랜치명 생성 (중복 방지를 위해 타임스탬프 포함)
        const timestamp = Date.now();
        this.randomBranchName = `auto-branch-${timestamp}`;
        console.log(`🌿 새 브랜치 생성: ${this.randomBranchName}`);
        
        // Important notice - Critical security release 창 처리
        await this.handleSecurityNoticeIfPresent(page);
        await page.waitForTimeout(1000);
        
        await page.getByTestId('add-to-tree').getByTestId('base-dropdown-toggle').click();
        await page.getByRole('link', { name: 'New branch' }).click();
        await page.getByRole('textbox', { name: 'Branch name' }).click();
        await page.getByRole('textbox', { name: 'Branch name' }).fill(this.randomBranchName);
        await page.getByRole('button', { name: 'Create branch' }).click();
      } else {
        console.log('✅ 이미 로그인된 상태');
      }
      
      console.log('✅ 새 탭에서 GitLab 로그인 및 저장소 접속 완료');
      return true;
      
    } catch (error) {
      console.error('❌ 새 탭에서 GitLab 로그인 실패:', error.message);
      throw error;
    }
  }

  // 생성된 랜덤 브랜치명 가져오기
  getRandomBranchName() {
    return this.randomBranchName;
  }

  // 새 탭에서 특정 파일로 이동
  async navigateToFileInNewTab(page, filePath) {
    try {
      console.log(`📄 새 탭에서 파일로 이동 중: ${filePath}`);
      await page.getByRole('link', { name: 'src' }).click();
      await page.getByTestId('file-tree-table').getByRole('link', { name: 'main' }).click();
      await page.getByRole('link', { name: 'resources' }).click();
      await page.getByRole('link', { name: 'templates' }).click();
      await page.getByRole('link', { name: 'memberList.html' }).click();
      console.log(`✅ 새 탭에서 파일 이동 완료: ${filePath}`);
    } catch (error) {
      console.error(`❌ 새 탭에서 파일 이동 실패: ${filePath}`, error.message);
      throw error;
    }
  }

  // 새 탭에서 파일 편집 모드 진입
  async enterEditModeInNewTab(page) {
    try {
      console.log('✏️ 새 탭에서 파일 편집 모드 진입 중...');
      await page.getByRole('button', { name: 'Edit' }).click();
      await page.getByRole('link', { name: 'Edit single file Edit this' }).click();
      console.log('✅ 새 탭에서 파일 편집 모드 진입 완료');
    } catch (error) {
      console.error('❌ 새 탭에서 파일 편집 모드 진입 실패:', error.message);
      throw error;
    }
  }

  // 새 탭에서 파일 내용 전체 교체
  async editLineContentInNewTab(page, lineNumber, newContent) {
    try {
      console.log('📝 새 탭에서 파일 내용 전체 교체 중...');
      
      // 템플릿 파일 읽기
      const templatePath = path.join(__dirname, '../../templates/memberList-template.html');
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      
      console.log('📄 템플릿 파일 읽기 완료');
      await page.getByRole('textbox', { name: 'Editor content;Press Alt+F1' }).click();
      await page.getByRole('textbox', { name: 'Editor content;Press Alt+F1' }).press('Control+a');
      await page.getByRole('textbox', { name: 'Editor content;Press Alt+F1' }).fill(templateContent);
      
      console.log('✅ 새 탭에서 파일 내용 전체 교체 완료');
    } catch (error) {
      console.error('❌ 새 탭에서 파일 내용 교체 실패:', error.message);
      throw error;
    }
  }

  // 새 탭에서 변경사항 커밋
  async commitChangesInNewTab(page, commitMessage) {
    try {
      console.log('💾 새 탭에서 변경사항 커밋 중...');
      await page.getByRole('button', { name: 'Commit changes' }).click();
      console.log('✅ 새 탭에서 변경사항 커밋 완료');
      
      // 커밋 완료 후 1초 대기
      console.log('⏳ 커밋 완료 후 1초 대기 중...');
      await page.waitForTimeout(1000);
      
    } catch (error) {
      console.error('❌ 새 탭에서 변경사항 커밋 실패:', error.message);
      throw error;
    }
  }

  // Important notice - Critical security release 창 처리
  async handleSecurityNoticeIfPresent(page) {
    try {
      console.log('🔍 Important notice 창 확인 중...');
      
      // "Remind me again in 3 days" 텍스트가 있는지 확인
      const remindButton = page.getByText('Remind me again in 3 days');
      const isRemindButtonVisible = await remindButton.isVisible();
      
      if (isRemindButtonVisible) {
        console.log('⚠️ Important notice 창 발견 - "Remind me again in 3 days" 버튼 클릭');
        await remindButton.click();
        console.log('✅ "Remind me again in 3 days" 버튼 클릭 완료');
        
        // 창이 닫힐 때까지 잠시 대기
        await page.waitForTimeout(1000);
      } else {
        console.log('✅ Important notice 창 없음 - 정상 진행');
      }
    } catch (error) {
      console.log(`⚠️ Important notice 창 처리 중 오류 (무시됨): ${error.message}`);
      // 오류가 발생해도 계속 진행
    }
  }
}

export default GitLabManager;