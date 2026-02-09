/**
 * Groq AI Client
 * 무료 AI API를 사용한 코드 변환
 * 
 * 특징:
 * - 완전 무료 (일일 14,400 requests)
 * - 매우 빠름 (초당 응답)
 * - Extension 불필요
 */

import https from 'https';

export class GroqClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'api.groq.com';
    this.model = 'llama-3.1-8b-instant'; // 빠르고 좋은 모델
  }

  /**
   * Playwright 코드를 자연어로 변환
   */
  async convert(code) {
    const prompt = `다음 Playwright 코드를 간결한 한국어 자연어로 변환해주세요.
답변은 자연어 설명만 작성하고, 추가 설명은 하지 마세요.

예시:
- 입력: await page.locator('.card').nth(2).click();
- 출력: 3번째 카드 클릭

코드:
${code}

자연어 설명:`;

    try {
      const response = await this._makeRequest({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // 일관성 있는 응답
        max_tokens: 100,  // 짧은 응답
      });

      const result = response.choices[0]?.message?.content?.trim();
      return this._cleanResponse(result);

    } catch (error) {
      console.error('[Groq] 변환 실패:', error.message);
      throw error;
    }
  }

  /**
   * Groq API 요청
   */
  _makeRequest(data) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);

      const options = {
        hostname: this.baseUrl,
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const parsed = JSON.parse(responseData);
              resolve(parsed);
            } catch (err) {
              reject(new Error(`JSON 파싱 실패: ${err.message}`));
            }
          } else {
            reject(new Error(`API 오류 (${res.statusCode}): ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`요청 실패: ${error.message}`));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * 응답 정제
   */
  _cleanResponse(response) {
    if (!response) return '';
    
    let text = response.trim();
    
    // 불필요한 부분 제거
    text = text.replace(/^(답변:|출력:|설명:)\s*/i, '');
    text = text.replace(/\n.*/g, ''); // 첫 줄만 사용
    text = text.replace(/^["']|["']$/g, ''); // 따옴표 제거
    
    return text;
  }
}

/**
 * 싱글톤 인스턴스
 */
let groqInstance = null;

export function getGroqClient(apiKey) {
  if (!groqInstance && apiKey) {
    groqInstance = new GroqClient(apiKey);
  }
  return groqInstance;
}

