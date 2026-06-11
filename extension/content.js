console.log('AI Job Helper Extension loaded');

const injectButton = () => {
  const existingButton = document.querySelector('.job-helper-btn');
  if (existingButton) {
    existingButton.remove();
  }

  const button = document.createElement('button');
  button.className = 'job-helper-btn';
  button.innerHTML = `
    <span class="btn-icon">🎯</span>
    <span class="btn-text">收集JD</span>
  `;
  button.style.cssText = `
    position: fixed;
    right: 24px;
    bottom: 24px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    border: none;
    border-radius: 50px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
    cursor: pointer;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 6px 24px rgba(99, 102, 241, 0.5)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.4)';
  });

  button.addEventListener('click', async () => {
    const jdData = extractJD();
    
    if (jdData.title) {
      chrome.storage.local.get('jdList', (result) => {
        const jdList = result.jdList || [];
        const exists = jdList.some(jd => jd.url === jdData.url);
        
        if (!exists) {
          jdList.push(jdData);
          chrome.storage.local.set({ jdList }, () => {
            showToast(`✅ 已收集: ${jdData.title}`);
          });
        } else {
          showToast(`⚠️ 已存在: ${jdData.title}`);
        }
      });
    } else {
      showToast('❌ 未能提取JD信息');
    }
  });

  document.body.appendChild(button);
};

const extractJD = () => {
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
};

const showToast = (message) => {
  const existingToast = document.querySelector('.job-helper-toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'job-helper-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    background: ${message.includes('✅') ? '#10b981' : message.includes('⚠️') ? '#f59e0b' : '#ef4444'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'all 0.3s';
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

const checkPage = () => {
  if (window.location.pathname.includes('/job_detail/') || 
      window.location.pathname.includes('/detail/') ||
      document.querySelector('.job-name, .detail-job-title')) {
    injectButton();
  }
};

checkPage();

let lastUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    checkPage();
  }
}, 1000);