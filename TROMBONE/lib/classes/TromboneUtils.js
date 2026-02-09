// TromboneUtils 클래스 - 공통 유틸리티 메서드들
class TromboneUtils {
  constructor(page) {
    this.page = page;
  }

  // 공통 대기 시간
  async wait(ms = 2000) {
    await this.page.waitForTimeout(ms);
  }

  // 메뉴 클릭
  async clickMenu(menuText) {
    await this.page.waitForSelector(`text=${menuText}`, { state: 'visible' });
    await this.page.getByText(menuText).click();
  }

  // 메뉴 클릭 (first 사용) - JUnit 관리용
  async clickMenuFirst(menuText) {
    await this.page.waitForSelector(`text=${menuText}`, { state: 'visible' });
    await this.page.getByText(menuText).first().click();
  }

  // 즐겨찾기 메뉴 클릭 후 서브메뉴 클릭
  async clickSubMenu(favoriteText, subMenuText) {
    await this.clickMenu(favoriteText);
    await this.clickMenu(subMenuText);
  }

  // 즐겨찾기 메뉴 클릭 후 서브메뉴 클릭 (first 사용) - JUnit 관리용
  async clickSubMenuFirst(favoriteText, subMenuText) {
    await this.clickMenuFirst(favoriteText);
    await this.clickMenuFirst(subMenuText);
  }

  // 즐겨찾기 메뉴는 한 번만 클릭하고, 서브메뉴만 클릭 (first 사용)
  async clickSubMenuOnly(subMenuText) {
    await this.clickMenuFirst(subMenuText);
  }

  // 등록 버튼 클릭
  async clickRegister() {
    await this.page.waitForSelector('text=등록', { state: 'visible' });
    await this.page.getByText('등록', { exact: true }).click();
  }

  // 저장 및 확인
  async saveAndConfirm() {
    await this.page.click('button:has-text("저장")');
    await this.page.click('button:has-text("확인")');
  }

  // 취소 및 확인
  async cancelAndConfirm() {
    await this.page.click('button:has-text("취소")');
    await this.page.click('button:has-text("확인")');
  }

  // 요소 존재 여부 확인
  async elementExists(selector) {
    return await this.page.locator(selector).count() > 0;
  }

  // 입력 필드 채우기
  async fillInput(selector, value) {
    await this.page.waitForSelector(selector, { state: 'visible' });
    await this.page.fill(selector, value);
  }

  // 모나코 에디터에 텍스트 입력
  async fillMonacoEditor(content) {
    // 클립보드에 복사
    await this.page.evaluate((text) => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }, content);

    // 에디터 클릭 후 붙여넣기
    const editorSelector = '#root > div > main > div > div.box-content-wrap > form > div > div > div.flex.col > div.grid.cols-1 > div > div > div > section > div > div > div.overflow-guard > div.monaco-scrollable-element.editor-scrollable.vs-dark > div.lines-content.monaco-editor-background > div.view-lines.monaco-mouse-cursor-text';
    await this.page.click(editorSelector);
    await this.page.keyboard.press('Control+a');
    await this.page.keyboard.press('Backspace');
    await this.page.keyboard.press('Control+v');
  }
}

export default TromboneUtils; 