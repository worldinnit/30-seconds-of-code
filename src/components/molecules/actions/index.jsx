import React from 'react';
import PropTypes from 'typedefs/proptypes';
import { CopyButton, CodepenButton, ShareButton } from 'components/atoms/button';
import JSX_SNIPPET_PRESETS from 'config/jsxSnippetPresets';
import literals from 'lang/en/client/common';

const propTypes = {
  snippet: PropTypes.snippet,
};

/**
 * Generic button component.
 */
const Actions = ({
  snippet,
}) => {
  const showCopy = snippet.code && snippet.code.src && !snippet.language.otherLanguages;
  const showCodepen = snippet.code && snippet.code.src && snippet.language.otherLanguages;
  const showCssCodepen = snippet.code && snippet.code.css && snippet.language.otherLanguages;
  return (
    <>
      <ShareButton
        pageTitle={ snippet.title }
        pageDescription={ snippet.description }
      />
      { showCopy && <CopyButton text={ snippet.code.src } /> }
      { showCodepen &&
        <CodepenButton
          jsCode={ `${snippet.code.src}\n\n${snippet.code.example}` }
          htmlCode={ JSX_SNIPPET_PRESETS.envHtml }
          cssCode={ snippet.code.style }
          jsPreProcessor={ JSX_SNIPPET_PRESETS.jsPreProcessor }
          jsExternal={ JSX_SNIPPET_PRESETS.jsImports }
        />
      }
      { showCssCodepen &&
        <CodepenButton
          cssCode={ snippet.code.css }
          htmlCode={ snippet.code.html }
          jsCode={ snippet.code.js }
        />
      }
      <a
        className='btn icon icon-github'
        href={ snippet.url }
        rel='nofollow noopener noreferrer'
        target='_blank'
      >
        { literals.viewOnGitHub }
      </a>
      {
        process.env.ENV === 'development' &&
        <a
          className='btn icon icon-vscode'
          href={ snippet.vscodeUrl }
          rel='nofollow noopener noreferrer'
          target='_blank'
        >
          { literals.openInVscode }
        </a>
      }
    </>
  );
};

Actions.propTypes = propTypes;

export default Actions;