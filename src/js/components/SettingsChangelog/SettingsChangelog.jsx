// ======================================================================
// IMPORTS
// ======================================================================

import changelog from '../../../CHANGELOG.md?raw';

// ======================================================================
// COMPONENT
// ======================================================================

const SettingsChangelog = () => {
  return (
    <div className="settingsGroup">
      <div className="font-markdown">
        {changelog.split(/<!--[\s\S]*?-->/g).map((item, key) => {
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

// const removeHtmlComments = (input) => {
//   if (!input || typeof input !== 'string') return '';
//   return input.replace(/<!--[\s\S]*?-->/g, '');
// };

const convertMarkdown = (text) => {
  let convertedMarkdown = convertLists(text);
  convertedMarkdown = convertLines(convertedMarkdown);
  convertedMarkdown = convertInlineCode(convertedMarkdown);
  return convertedMarkdown;
};

const convertInlineCode = (text) => {
  return text.replace(/`([^`]+)`/g, '<code>$1</code>');
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
        listDepth = 0;
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
    listDepth = 0;
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
