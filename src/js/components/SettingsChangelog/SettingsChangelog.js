// ======================================================================
// IMPORTS
// ======================================================================

import { useEffect, useState } from 'react';

import changelog from 'CHANGELOG.md';

import style from './SettingsChangelog.module.scss';

// ======================================================================
// COMPONENT
// ======================================================================

const SettingsChangelog = () => {
  const [markdownContent, setMarkdownContent] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(changelog);
      const data = await response.text();
      setMarkdownContent(data);
    };
    fetchData();
  }, []);

  return (
    <div className={style.wrap}>
      <div className="font-markdown">
        {markdownContent
          .replace(/<!--[\s\S]*?-->/g, '')
          .split(/<a[^>]*><\/a>/)
          .map((item, key) => {
            if (item) {
              const myHtml = convertMarkdown(item.trim());
              if (myHtml) {
                return <div key={key} dangerouslySetInnerHTML={{ __html: myHtml }}></div>;
              }
            }
            return null;
          })}
      </div>
    </div>
  );
};

// ======================================================================
// HELPERS
// ======================================================================

const convertMarkdown = (text) => {
  let convertedMarkdown = convertLists(text);
  convertedMarkdown = convertLines(convertedMarkdown);
  return convertedMarkdown;
};

const convertLists = (text) => {
  const lines = text.split('\n');
  let result = '';
  let listStarted = false;
  let listDepth = 0;
  const listStack = [];

  for (let line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('-')) {
      const listItem = trimmedLine.substring(1).trim();
      const listItemIndentation = line.indexOf('-') / 2;
      if (!listStarted) {
        listStarted = true;
        result += '<ul>';
      }

      if (listItemIndentation > listDepth) {
        // Start a nested list
        listDepth = listItemIndentation;
        listStack.push(listDepth);
        result += '<ul>';
      } else if (listItemIndentation < listDepth) {
        // Close nested lists until reaching the appropriate depth
        while (listItemIndentation < listDepth) {
          listDepth = listStack.pop() - 1 || 0;
          result += '</ul>';
        }
      }

      result += `<li>${listItem}</li>`;
    } else {
      if (listStarted) {
        listStarted = false;
        // Close any remaining nested lists
        while (listStack.length > 0) {
          result += '</ul>';
          listStack.pop();
        }
        result += '</ul>';
      }
      result += line + '\n';
    }
  }

  if (listStarted) {
    listStarted = false;
    while (listStack.length > 0) {
      result += '</ul>';
      listStack.pop();
    }
    result += '</ul>';
  }

  return result;
};

const convertLines = (text) => {
  const lines = text.split('\n');
  let result = '';

  for (let line of lines) {
    if (line.startsWith('#')) {
      const headerText = line.substring(1).trim();
      result += `<h2>${headerText}</h2>`;
    } else {
      const plainText = line.trim();
      if (plainText !== '') {
        result += `<p>${plainText}</p>`;
      }
    }
  }

  return result;
};

// ======================================================================
// EXPORT
// ======================================================================

export default SettingsChangelog;
