class JobHelperExtension {
  constructor() {
    this.jdList = [];
    this.serverUrl = '';
    this.init();
  }

  init() {
    this.loadServerUrl();
    this.loadJDList();
    this.bindEvents();
  }

  async loadServerUrl() {
    const result = await chrome.storage.local.get('serverUrl');
    this.serverUrl = result.serverUrl || 'http://localhost:3000';
    document.getElementById('server-url').textContent = this.serverUrl;
  }

  async loadJDList() {
    const result = await chrome.storage.local.get('jdList');
    this.jdList = result.jdList || [];
    this.renderJDList();
    this.updateJDCount();
  }

  bindEvents() {
    document.getElementById('capture-btn').addEventListener('click', () => this.captureJD());
    document.getElementById('sync-btn').addEventListener('click', () => this.syncJDs());
    document.getElementById('settings-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.showSettings();
    });
  }

  async captureJD() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('zhipin.com')) {
      this.showError('请在Boss直聘职位页面使用');
      return;
    }

    try {
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: this.extractJDFromPage
      });

      if (result && result[0] && result[0].result) {
        const jdData = result[0].result;
        this.addJD(jdData);
        this.showSuccess('JD收集成功！');
      } else {
        this.showError('未能提取JD信息');
      }
    } catch (error) {
      console.error('Capture JD error:', error);
      this.showError('收集失败，请重试');
    }
  }

  extractJDFromPage() {
    const jdData = {
      title: '',
      company: '',
      location: '',
      salary: '',
      experience: '',
      education: '',
      description: '',
      requirements: '',
      url: window.location.href,
      timestamp: Date.now()
    };

    const titleElement = document.querySelector('.job-name') || 
                         document.querySelector('h1') ||
                         document.querySelector('.detail-job-title');
    if (titleElement) {
      jdData.title = titleElement.textContent.trim();
    }

    const companyElement = document.querySelector('.company-name') ||
                          document.querySelector('.info-company') ||
                          document.querySelector('.company-title');
    if (companyElement) {
      jdData.company = companyElement.textContent.trim();
    }

    const salaryElement = document.querySelector('.salary') ||
                         document.querySelector('.job-salary');
    if (salaryElement) {
      jdData.salary = salaryElement.textContent.trim();
    }

    const tags = document.querySelectorAll('.tag-item, .job-tag, .info-tag');
    tags.forEach(tag => {
      const text = tag.textContent.trim();
      if (text.includes('年') && !jdData.experience) {
        jdData.experience = text;
      } else if (['大专', '本科', '硕士', '博士'].some(edu => text.includes(edu)) && !jdData.education) {
        jdData.education = text;
      } else if (text.includes('经验')) {
        jdData.experience = text;
      }
    });

    const locationElement = document.querySelector('.job-area') ||
                          document.querySelector('.location');
    if (locationElement) {
      jdData.location = locationElement.textContent.trim();
    }

    const descriptionElement = document.querySelector('.job-sec .text') ||
                             document.querySelector('.job-detail-content') ||
                             document.querySelector('.detail-content');
    if (descriptionElement) {
      const sections = descriptionElement.querySelectorAll('div, p');
      let description = '';
      let requirements = '';
      
      sections.forEach(section => {
        const text = section.textContent.trim();
        if (text) {
          if (text.includes('职责') || text.includes('负责') || text.includes('工作内容')) {
            description += text + '\n';
          } else if (text.includes('要求') || text.includes('任职') || text.includes('资格')) {
            requirements += text + '\n';
          } else if (description.length < 500) {
            description += text + '\n';
          }
        }
      });
      
      jdData.description = description.trim();
      jdData.requirements = requirements.trim();
    }

    return jdData;
  }

  addJD(jdData) {
    const exists = this.jdList.some(jd => jd.url === jdData.url);
    if (!exists) {
      this.jdList.push(jdData);
      this.saveJDList();
      this.renderJDList();
      this.updateJDCount();
    }
  }

  async saveJDList() {
    await chrome.storage.local.set({ jdList: this.jdList });
  }

  renderJDList() {
    const container = document.getElementById('jd-list');
    
    if (this.jdList.length === 0) {
      container.innerHTML = `
        <div class="empty-state" id="empty-state">
          <svg viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 18H6v-2h10v2zm0-4H6v-2h10v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
          <p>访问Boss直聘职位页面<br/>点击下方按钮收集JD</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.jdList.map((jd, index) => `
      <div class="jd-item">
        <h4 class="jd-title">${jd.title || '未知职位'}</h4>
        <p class="jd-company">${jd.company || '未知公司'} · ${jd.salary || ''}</p>
      </div>
    `).join('');
  }

  updateJDCount() {
    document.getElementById('jd-count').textContent = this.jdList.length;
  }

  async syncJDs() {
    if (this.jdList.length === 0) {
      this.showError('请先收集JD信息');
      return;
    }

    if (!this.serverUrl) {
      this.showError('请先设置服务地址');
      return;
    }

    try {
      const response = await fetch(`${this.serverUrl}/api/import-jd`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jds: this.jdList,
          source: 'extension'
        })
      });

      const data = await response.json();

      if (response.ok) {
        this.showSuccess(`成功同步 ${this.jdList.length} 个JD到Job Helper`);
        this.jdList = [];
        await chrome.storage.local.set({ jdList: [] });
        this.renderJDList();
        this.updateJDCount();
        
        setTimeout(() => {
          chrome.tabs.create({ url: `${this.serverUrl}` });
        }, 1000);
      } else {
        this.showError(data.message || '同步失败');
      }
    } catch (error) {
      console.error('Sync error:', error);
      this.showError('同步失败，请检查服务地址是否正确');
    }
  }

  showSuccess(message) {
    const status = document.getElementById('sync-status');
    const error = document.getElementById('error-message');
    
    error.style.display = 'none';
    status.textContent = message;
    status.style.display = 'block';
    
    setTimeout(() => {
      status.style.display = 'none';
    }, 3000);
  }

  showError(message) {
    const status = document.getElementById('sync-status');
    const error = document.getElementById('error-message');
    
    status.style.display = 'none';
    error.textContent = message;
    error.style.display = 'block';
    
    setTimeout(() => {
      error.style.display = 'none';
    }, 4000);
  }

  showSettings() {
    const container = document.querySelector('.container');
    container.innerHTML = `
      <div class="header">
        <div class="logo">
          <svg viewBox="0 0 24 24">
            <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.39-1.08-.7-1.66-.94l-.38-2.65c-.03-.24-.24-.42-.48-.42h-4c-.24 0-.45.18-.48.42l-.38 2.65c-.58.24-1.14.55-1.66.94l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.12.22-.07.49.12.64l2.11 1.65c-.04.32-.07.64-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.39 1.08.7 1.66.94l.38 2.65c.03.24.24.42.48.42h4c.24 0 .45-.18.48-.42l.38-2.65c.58-.24 1.14-.55 1.66-.94l2.49 1c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
          </svg>
        </div>
        <h1 class="title">服务设置</h1>
        <p class="subtitle">配置AI Job Helper服务地址</p>
      </div>
      
      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 8px;">
          服务地址
        </label>
        <input 
          type="text" 
          id="server-input" 
          placeholder="http://localhost:3000"
          style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box;"
          value="${this.serverUrl}"
        />
      </div>

      <button class="btn btn-primary" id="save-settings-btn">
        💾 保存设置
      </button>
      
      <button class="btn btn-secondary" id="back-btn">
        ← 返回
      </button>
    `;

    document.getElementById('save-settings-btn').addEventListener('click', async () => {
      const input = document.getElementById('server-input');
      const newUrl = input.value.trim();
      
      if (newUrl) {
        await chrome.storage.local.set({ serverUrl: newUrl });
        this.serverUrl = newUrl;
        this.showSuccess('设置保存成功');
        
        setTimeout(() => {
          this.init();
        }, 1500);
      }
    });

    document.getElementById('back-btn').addEventListener('click', () => {
      this.init();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new JobHelperExtension();
});