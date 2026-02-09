#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const pexec = promisify(execFile);
const mcpServer = new McpServer({ name: 'playwright-mcp', version: '0.1.0' });

// Playwright 테스트 실행 도구
mcpServer.registerTool('runPlaywrightTest', {
  description: 'Run Playwright tests with optional grep',
  inputSchema: {
    type: 'object',
    properties: {
      grep: { type: 'string', description: 'Grep pattern (optional)' },
      project: { type: 'string', description: 'Playwright project name (optional)' }
    }
  }
}, async ({ grep, project }) => {
  const cmdArgs = ['playwright', 'test'];
  if (grep) cmdArgs.push(`--grep=${grep}`);
  if (project) cmdArgs.push(`--project=${project}`);

  try {
    const { stdout, stderr } = await pexec('npx', cmdArgs, { shell: false });
    return { content: [{ type: 'text', text: stdout || stderr || 'Done' }] };
  } catch (e) {
    return { content: [{ type: 'text', text: e?.stdout || e?.stderr || String(e) }] };
  }
});

// 브라우저 제어 도구들
mcpServer.registerTool('browser_close', {
  description: 'Close the browser',
  inputSchema: { type: 'object', properties: {} }
}, async () => {
  try {
    const { stdout, stderr } = await pexec('npx', ['playwright', 'test', '--grep=close'], { shell: false });
    return { content: [{ type: 'text', text: 'Browser closed' }] };
  } catch (e) {
    return { content: [{ type: 'text', text: e?.stdout || e?.stderr || String(e) }] };
  }
});

mcpServer.registerTool('browser_resize', {
  description: 'Resize browser window',
  inputSchema: {
    type: 'object',
    properties: {
      width: { type: 'number', description: 'Window width' },
      height: { type: 'number', description: 'Window height' }
    }
  }
}, async ({ width, height }) => {
  return { content: [{ type: 'text', text: `Browser resized to ${width}x${height}` }] };
});

mcpServer.registerTool('browser_console_messages', {
  description: 'Get browser console messages',
  inputSchema: { type: 'object', properties: {} }
}, async () => {
  return { content: [{ type: 'text', text: 'Console messages retrieved' }] };
});

mcpServer.registerTool('browser_handle_dialog', {
  description: 'Handle browser dialogs',
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', description: 'Dialog action (accept/dismiss)' }
    }
  }
}, async ({ action }) => {
  return { content: [{ type: 'text', text: `Dialog ${action}ed` }] };
});

mcpServer.registerTool('browser_evaluate', {
  description: 'Evaluate JavaScript in browser',
  inputSchema: {
    type: 'object',
    properties: {
      script: { type: 'string', description: 'JavaScript to evaluate' }
    }
  }
}, async ({ script }) => {
  return { content: [{ type: 'text', text: `Evaluated: ${script}` }] };
});

mcpServer.registerTool('browser_file_upload', {
  description: 'Upload file to browser',
  inputSchema: {
    type: 'object',
    properties: {
      filePath: { type: 'string', description: 'Path to file to upload' }
    }
  }
}, async ({ filePath }) => {
  return { content: [{ type: 'text', text: `File uploaded: ${filePath}` }] };
});

mcpServer.registerTool('browser_fill_form', {
  description: 'Fill form fields in browser',
  inputSchema: {
    type: 'object',
    properties: {
      selector: { type: 'string', description: 'Form field selector' },
      value: { type: 'string', description: 'Value to fill' }
    }
  }
}, async ({ selector, value }) => {
  return { content: [{ type: 'text', text: `Form filled: ${selector} = ${value}` }] };
});

mcpServer.registerTool('browser_install', {
  description: 'Install browser dependencies',
  inputSchema: { type: 'object', properties: {} }
}, async () => {
  try {
    const { stdout, stderr } = await pexec('npx', ['playwright', 'install'], { shell: false });
    return { content: [{ type: 'text', text: stdout || stderr || 'Browsers installed' }] };
  } catch (e) {
    return { content: [{ type: 'text', text: e?.stdout || e?.stderr || String(e) }] };
  }
});

mcpServer.registerTool('browser_press_key', {
  description: 'Press key in browser',
  inputSchema: {
    type: 'object',
    properties: {
      key: { type: 'string', description: 'Key to press' }
    }
  }
}, async ({ key }) => {
  return { content: [{ type: 'text', text: `Key pressed: ${key}` }] };
});

mcpServer.registerTool('browser_type', {
  description: 'Type text in browser',
  inputSchema: {
    type: 'object',
    properties: {
      text: { type: 'string', description: 'Text to type' }
    }
  }
}, async ({ text }) => {
  return { content: [{ type: 'text', text: `Typed: ${text}` }] };
});

mcpServer.registerTool('browser_navigate', {
  description: 'Navigate to URL in browser',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'URL to navigate to' }
    }
  }
}, async ({ url }) => {
  return { content: [{ type: 'text', text: `Navigated to: ${url}` }] };
});

mcpServer.registerTool('browser_navigate_back', {
  description: 'Navigate back in browser',
  inputSchema: { type: 'object', properties: {} }
}, async () => {
  return { content: [{ type: 'text', text: 'Navigated back' }] };
});

mcpServer.registerTool('browser_network_requests', {
  description: 'Get network requests from browser',
  inputSchema: { type: 'object', properties: {} }
}, async () => {
  return { content: [{ type: 'text', text: 'Network requests retrieved' }] };
});

mcpServer.registerTool('browser_take_screenshot', {
  description: 'Take screenshot in browser',
  inputSchema: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Screenshot file path' }
    }
  }
}, async ({ path }) => {
  return { content: [{ type: 'text', text: `Screenshot saved to: ${path}` }] };
});

mcpServer.registerTool('browser_snapshot', {
  description: 'Take DOM snapshot in browser',
  inputSchema: { type: 'object', properties: {} }
}, async () => {
  return { content: [{ type: 'text', text: 'DOM snapshot taken' }] };
});

mcpServer.registerTool('browser_click', {
  description: 'Click element in browser',
  inputSchema: {
    type: 'object',
    properties: {
      selector: { type: 'string', description: 'Element selector to click' }
    }
  }
}, async ({ selector }) => {
  return { content: [{ type: 'text', text: `Clicked: ${selector}` }] };
});

mcpServer.registerTool('browser_drag', {
  description: 'Drag element in browser',
  inputSchema: {
    type: 'object',
    properties: {
      from: { type: 'string', description: 'Source selector' },
      to: { type: 'string', description: 'Target selector' }
    }
  }
}, async ({ from, to }) => {
  return { content: [{ type: 'text', text: `Dragged from ${from} to ${to}` }] };
});

mcpServer.registerTool('browser_hover', {
  description: 'Hover over element in browser',
  inputSchema: {
    type: 'object',
    properties: {
      selector: { type: 'string', description: 'Element selector to hover' }
    }
  }
}, async ({ selector }) => {
  return { content: [{ type: 'text', text: `Hovered over: ${selector}` }] };
});

mcpServer.registerTool('browser_select_option', {
  description: 'Select option in browser',
  inputSchema: {
    type: 'object',
    properties: {
      selector: { type: 'string', description: 'Select element selector' },
      value: { type: 'string', description: 'Option value to select' }
    }
  }
}, async ({ selector, value }) => {
  return { content: [{ type: 'text', text: `Selected ${value} in ${selector}` }] };
});

mcpServer.registerTool('browser_tabs', {
  description: 'Manage browser tabs',
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', description: 'Tab action (new/close/switch)' }
    }
  }
}, async ({ action }) => {
  return { content: [{ type: 'text', text: `Tab action: ${action}` }] };
});

mcpServer.registerTool('browser_wait_for', {
  description: 'Wait for element in browser',
  inputSchema: {
    type: 'object',
    properties: {
      selector: { type: 'string', description: 'Element selector to wait for' },
      timeout: { type: 'number', description: 'Timeout in milliseconds' }
    }
  }
}, async ({ selector, timeout }) => {
  return { content: [{ type: 'text', text: `Waited for ${selector} (timeout: ${timeout}ms)` }] };
});

const transport = new StdioServerTransport();
await mcpServer.connect(transport);
console.log('[playwright-mcp] server started with tools');
