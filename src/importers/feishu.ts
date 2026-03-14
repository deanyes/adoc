import https from 'https';

export class FeishuClient {
  private appId: string;
  private appSecret: string;
  private accessToken: string = '';
  
  constructor(appId: string, appSecret: string) {
    this.appId = appId;
    this.appSecret = appSecret;
  }
  
  async init() {
    // 获取 tenant_access_token
    const resp = await this.request('POST', '/auth/v3/tenant_access_token/internal', {
      app_id: this.appId,
      app_secret: this.appSecret
    });
    this.accessToken = resp.tenant_access_token;
  }
  
  async getSpaceNodes(spaceId: string): Promise<any[]> {
    const nodes: any[] = [];
    let pageToken = '';
    
    do {
      const resp = await this.request(
        'GET',
        `/wiki/v2/spaces/${spaceId}/nodes?page_size=50${pageToken ? `&page_token=${pageToken}` : ''}`
      );
      nodes.push(...(resp.items || []));
      pageToken = resp.page_token || '';
    } while (pageToken);
    
    return nodes;
  }
  
  async getDocument(docToken: string): Promise<any> {
    const resp = await this.request('GET', `/docx/v1/documents/${docToken}`);
    return resp.document;
  }
  
  async getDocumentBlocks(docToken: string): Promise<any[]> {
    const blocks: any[] = [];
    let pageToken = '';
    
    do {
      const resp = await this.request(
        'GET',
        `/docx/v1/documents/${docToken}/blocks?page_size=500${pageToken ? `&page_token=${pageToken}` : ''}`
      );
      blocks.push(...(resp.items || []));
      pageToken = resp.page_token || '';
    } while (pageToken);
    
    return blocks;
  }
  
  async downloadImage(token: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'open.feishu.cn',
        path: `/open-apis/drive/v1/medias/${token}/download`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      };
      
      const req = https.request(options, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      });
      
      req.on('error', reject);
      req.end();
    });
  }
  
  async toMarkdown(doc: any, options: { downloadImages?: boolean; imagesDir?: string } = {}): Promise<string> {
    const blocks = await this.getDocumentBlocks(doc.document_id);
    return this.blocksToMarkdown(blocks, options);
  }
  
  private blocksToMarkdown(blocks: any[], options: any): string {
    let md = '';
    
    for (const block of blocks) {
      switch (block.block_type) {
        case 2: // Text
          md += this.textToMarkdown(block.text) + '\n\n';
          break;
        case 3: // Heading 1
          md += `# ${this.textToMarkdown(block.heading1)}\n\n`;
          break;
        case 4: // Heading 2
          md += `## ${this.textToMarkdown(block.heading2)}\n\n`;
          break;
        case 5: // Heading 3
          md += `### ${this.textToMarkdown(block.heading3)}\n\n`;
          break;
        case 12: // Bullet list
          md += `- ${this.textToMarkdown(block.bullet)}\n`;
          break;
        case 13: // Ordered list
          md += `1. ${this.textToMarkdown(block.ordered)}\n`;
          break;
        case 27: // Image
          const token = block.image?.token;
          if (token) {
            md += `![](./images/${token}.png)\n\n`;
          }
          break;
      }
    }
    
    return md;
  }
  
  private textToMarkdown(textObj: any): string {
    if (!textObj?.elements) return '';
    
    return textObj.elements.map((el: any) => {
      if (el.text_run) {
        let text = el.text_run.content || '';
        const style = el.text_run.text_element_style || {};
        if (style.bold) text = `**${text}**`;
        if (style.italic) text = `*${text}*`;
        if (style.strikethrough) text = `~~${text}~~`;
        if (style.inline_code) text = `\`${text}\``;
        return text;
      }
      return '';
    }).join('');
  }
  
  private async request(method: string, path: string, body?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'open.feishu.cn',
        path: `/open-apis${path}`,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(this.accessToken ? { 'Authorization': `Bearer ${this.accessToken}` } : {})
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.code !== 0) {
              reject(new Error(`Feishu API error: ${json.msg}`));
            } else {
              resolve(json.data);
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }
}
