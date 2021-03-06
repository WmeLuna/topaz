(async () => {
const { React } = goosemod.webpackModules.common;
window.React = React; // pain but have to

const forceWrap = (comp, key) => class extends React.PureComponent {
  render() {
    return React.createElement(comp, {
      ...this.props,
      onChange: x => {
        this.props[key] = x;
        this.forceUpdate();

        this.props.onChange(x);
      }
    });
  }
};

const SwitchItem = forceWrap(goosemod.webpackModules.findByDisplayName('SwitchItem'), 'value');
const SingleSelect = forceWrap(goosemod.webpackModules.findByProps('SingleSelect').SingleSelect, 'value');

const debounce = (handler, timeout) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => handler(...args), timeout);
  };
};

const imp = async url => eval(await (await fetch(url)).text());

const patchAppend = (which) => { // sorry
  const orig = document[which].appendChild;

  document[which].appendChild = function(el) {
    if (el.nodeName === 'SCRIPT' && el.src.includes('monaco')) {
      (async () => {
        console.log('monaco', which, el.src);
        (1, eval)(await (await fetch(el.src)).text());
        el.onload?.();
      })();

      return;
    }

    return orig.apply(this, arguments);
  };
};

patchAppend('body');
patchAppend('head');

if (!window.monaco) { // only load once, or errors
  // monaco loader and react dependencies
  await imp('https://unpkg.com/prop-types@15.7.2/prop-types.js');
  await imp('https://unpkg.com/state-local@1.0.7/lib/umd/state-local.min.js');

  await imp('https://unpkg.com/@monaco-editor/loader@1.3.2/lib/umd/monaco-loader.min.js'); // monaco loader
  await imp('https://unpkg.com/@monaco-editor/react@4.4.5/lib/umd/monaco-react.min.js'); // monaco react
}


const MonacoEditor = monaco_react.default;

const langs = {
  'js': 'javascript',
  'jsx': 'javascript', // jsx is half broken because monaco bad but do anyway
  'css': 'css',
  'html':'html'
};

const TabBar = goosemod.webpackModules.findByDisplayName('TabBar');
const TabBarClasses1 = goosemod.webpackModules.findByProps('topPill');
const TabBarClasses2 = goosemod.webpackModules.findByProps('tabBar', 'nowPlayingColumn');

const PanelButton = goosemod.webpackModules.findByDisplayName('PanelButton');
const _Switch = goosemod.webpackModules.findByDisplayName('Switch');
const Switch = forceWrap(_Switch, 'checked');

const ScrollerClasses = goosemod.webpackModules.findByProps('scrollerBase', 'auto', 'thin');

let lastPlugin;
let expandInt;

const editorSettings = JSON.parse(localStorage.getItem('topaz_editor_settings') ?? 'null') ?? {
  theme: 'vs-dark',
  focusMode: true
};

const saveEditorSettings = () => localStorage.setItem('topaz_editor_settings', JSON.stringify(editorSettings));

const _loadedThemes = {};
const setTheme = async (x) => {
  if (!x.startsWith('vs') && !_loadedThemes[x]) _loadedThemes[x] = monaco.editor.defineTheme(x, await (await fetch(`https://raw.githubusercontent.com/brijeshb42/monaco-themes/master/themes/${x}.json`)).json());

  monaco.editor.setTheme(x);
  editorSettings.theme = x;
};
setTimeout(() => setTheme(editorSettings.theme), 100);

const focus_enlarge = () => document.body.classList.add('topaz-editor-focus');
const focus_revert = () => document.body.classList.remove('topaz-editor-focus');


const selections = {};

let ignoreNextSelect = false;
return function Editor(props) {
  let { files, defaultFile, plugin, toggled, fileIcons } = props;
  defaultFile = defaultFile ?? Object.keys(files)[0] ?? '';

  const loadPreviousSelection = (file) => {
    setTimeout(() => {
      const ref = editorRef.current;
      console.log(ref);

      if (selections[plugin.entityID + file]) {
        ref.setSelection(selections[plugin.entityID + file]);
        ref.revealLineInCenter(selections[plugin.entityID + file].startLineNumber);
      } else ref.revealLine(0);

      ref.focus();
    }, editorRef.current ? 20 : 200);
  };

  const editorRef = React.useRef(null);
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  const [ openFile, setOpenFile ] = React.useState(defaultFile);

  if (lastPlugin !== plugin.entityID) { // dispose models to clean up
    lastPlugin = plugin.entityID;
    if (window.monaco) monaco.editor.getModels().forEach(x => x.dispose());

    loadPreviousSelection(openFile);
  }


  if (!expandInt && editorSettings.focusMode) {
    expandInt = setInterval(() => {
      if (document.querySelector('.topaz-editor')) return;

      clearInterval(expandInt);
      expandInt = undefined;

      focus_revert();
    }, 300);

    focus_enlarge();
  }

  const openExt = openFile.split('.').pop();

  const langToImg = (lang, size = 24) => {
    let img, props = {};

    switch (lang) {
      case 'js':
        img = 'https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/javascript.svg';
        break;

      case 'jsx':
        img = 'https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/react.svg';
        props.style = { filter: 'hue-rotate(220deg) brightness(1.5)' }; // HS yellow
        break;

      case 'ts':
        img = 'https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/typescript.svg';
        break;

      case 'tsx':
        img = 'https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/react.svg';
        props.style = { filter: 'hue-rotate(20deg) brightness(1.5)' }; // TS blue
        break;

      case 'css':
        img = 'https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/css.svg';
        break;

      case 'scss':
        img = 'https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/sass.svg';
        break;
    }

    return React.createElement('img', {
      src: img,
      ...props,

      width: size,
      height: size
    });
  };

  console.log('render', files, defaultFile, openFile, files[openFile] === undefined, openExt);

  return React.createElement('div', {
    className: 'topaz-editor'
  },
    React.createElement(TabBar, {
      selectedItem: openFile,

      className: [ TabBarClasses2.tabBar, ScrollerClasses.auto ].join(' '),
      type: TabBarClasses1.top,
      look: 1,

      onItemSelect: (x) => {
        if (x.startsWith('#')) return;
        if (ignoreNextSelect) return ignoreNextSelect = false;

        selections[plugin.entityID + openFile] = editorRef.current.getSelection();

        setOpenFile(x);
        props.onOpen?.(x);

        if (openFile !== x) loadPreviousSelection(x);
      }
    },
      ...Object.keys(files).map(x => React.createElement(TabBar.Item, {
        id: x,
        className: TabBarClasses2.item
      },
        !fileIcons ? null : React.createElement(SingleSelect, {
          onChange: y => {
            const newFile = x.split('.').slice(0, -1).join('.') + '.' + y;

            props.onRename?.(x, newFile);
            if (openFile === x) {
              setOpenFile(newFile);
              forceUpdate(); // sorry :)
              setImmediate(() => document.querySelector('#inptab-' + newFile.replace(/[^A-Za-z0-9]/g, '_')).parentElement.click());
            }
          },
          options: [ 'css', 'scss', '-', 'js', 'jsx', '-', 'ts', 'tsx' ].map(y => ({
            label: y,
            value: y
          })),
          value: x.split('.').pop() ?? 'css',

          popoutClassName: 'topaz-file-popout',

          renderOptionValue: ([ { value } ]) => langToImg(value, 24),
          renderOptionLabel: ({ value }) => value === '-' ? '' : React.createElement(React.Fragment, {},
            langToImg(value, 24),

            value.toUpperCase()
          )
        }),

        React.createElement('input', {
          type: 'text',
          autocomplete: 'off',
          spellcheck: 'false',
          autocorrect: 'off',

          value: fileIcons ? x.split('.').slice(0, -1).join('.') : x,
          id: 'inptab-' + x.replace(/[^A-Za-z0-9]/g, '_'),

          style: {
            width: (x.length * 0.8) + 'ch'
          },

          onChange: (e) => {
            let val = e.target.value;
            if (fileIcons) val += '.' + x.split('.').pop();

            if (!document.querySelector('.topaz-snippets')) document.querySelector('#inptab-' + x.replace(/[^A-Za-z0-9]/g, '_')).style.width = (val.length * 0.8) + 'ch';

            props.onRename?.(x, val);

            if (openFile === x) setOpenFile(val);
          }
        }),

        plugin.entityID !== 'snippets' ? null : React.createElement(Switch, {
          checked: toggled[x] ?? true,
          onChange: (y) => props.onToggle?.(x, y)
        }),

        React.createElement(PanelButton, {
          icon: goosemod.webpackModules.findByDisplayName('Trash'),
          tooltipText: 'Delete',
          onClick: () => {
            ignoreNextSelect = true;

            const originalIndex = Object.keys(files).indexOf(openFile);

            props.onDelete?.(x);

            if (openFile === x) {
              let newOpenIndex = originalIndex - 1;
              if (newOpenIndex < 0) newOpenIndex = 0;

              setOpenFile(Object.keys(files)[newOpenIndex] ?? '');
            } else forceUpdate();
          }
        })
      )),

      React.createElement(TabBar.Item, {
        id: '#new',

        className: TabBarClasses2.item
      }, React.createElement(PanelButton, {
        icon: goosemod.webpackModules.findByDisplayName('PlusAlt'),
        tooltipText: 'New',
        onClick: () => {
          const name = fileIcons ? '.css' : '';

          files[name] = '';
          if (openFile === name) forceUpdate();
            else setOpenFile(name);

          setTimeout(() => document.querySelector('#inptab-' + name.replace(/[^A-Za-z0-9]/g, '_')).focus(), 100);

          props.onNew?.(name);
        }
      })),

      React.createElement(TabBar.Item, {
        id: '#settings',

        className: TabBarClasses2.item
      }, React.createElement(PanelButton, {
        icon: goosemod.webpackModules.findByDisplayName('Gear'),
        tooltipText: 'Editor Settings',
        onClick: async () => {
          const LegacyHeader = goosemod.webpackModules.findByDisplayName('LegacyHeader');
          const ModalStuff = goosemod.webpackModules.findByProps('ModalRoot');
          const { openModal } = goosemod.webpackModules.findByProps('openModal', 'updateModal');
          const Flex = goosemod.webpackModules.findByDisplayName('Flex');

          const FormTitle = goosemod.webpackModules.findByDisplayName('FormTitle');

          const titleCase = (str) => str.split(' ').map(x => x[0].toUpperCase() + x.slice(1)).join(' ');

          openModal((e) => {
            return React.createElement(ModalStuff.ModalRoot, {
              transitionState: e.transitionState,
              size: 'large'
            },
              React.createElement(ModalStuff.ModalHeader, {},
                React.createElement(Flex.Child, {
                  basis: 'auto',
                  grow: 1,
                  shrink: 1,
                  wrap: false,
                },
                  React.createElement(LegacyHeader, {
                    tag: 'h2',
                    size: LegacyHeader.Sizes.SIZE_20,
                  }, 'Editor Settings')
                ),
                React.createElement('FlexChild', {
                  basis: 'auto',
                  grow: 0,
                  shrink: 1,
                  wrap: false
                },
                  React.createElement(ModalStuff.ModalCloseButton, {
                    onClick: e.onClose
                  })
                )
              ),

              React.createElement(ModalStuff.ModalContent, {
                className: `topaz-modal-content`
              },
                React.createElement(SwitchItem, {
                  note: 'Enlarges settings content for larger editor',
                  value: editorSettings.focusMode,
                  onChange: x => {
                    editorSettings.focusMode = x;
                    saveEditorSettings();

                    if (x) focus_enlarge();
                      else focus_revert();
                  }
                }, 'Focus Mode'),

                React.createElement(FormTitle, {
                  tag: 'h5'
                }, 'Theme'),

                React.createElement(SingleSelect, {
                  onChange: x => {
                    setTheme(x);
                    saveEditorSettings();
                  },
                  options: [ 'vs-dark', 'vs-light', 'Dracula', 'Monokai', 'Nord', 'Twilight' ].map(x => ({
                    label: titleCase(x.replace('vs-', 'VS ')),
                    value: x
                  })),
                  value: editorSettings.theme
                })
              )
            )
          });
        }
      })),

      React.createElement(TabBar.Item, {
        id: '#reload',

        className: TabBarClasses2.item
      }, React.createElement(PanelButton, {
        icon: goosemod.webpackModules.findByDisplayName('Retry'),
        tooltipText: 'Reload Plugin',
        onClick: async () => {
          topaz.reload(plugin.__entityID);
          goosemod.webpackModules.findByProps('showToast').showToast(goosemod.webpackModules.findByProps('createToast').createToast('Reloaded ' + plugin.manifest.name, 0, { duration: 5000, position: 1 }));
        }
      }))
    ),

    files[openFile] === undefined ? React.createElement('section', {
      className: 'topaz-editor-no-files',
    },
      React.createElement('div', {}, 'You have no ' + (plugin.entityID === 'snippets' ? 'snippets' : 'files')),
      React.createElement('div', {},
        'Make a ' + (plugin.entityID === 'snippets' ? 'snippet' : 'file') + ' with the',
        React.createElement(goosemod.webpackModules.findByDisplayName('PlusAlt'), {
          width: 20,
          height: 20
        }),
        'icon in the ' + (plugin.entityID === 'snippets' ? 'sidebar' : 'tabbar')
      )
    ) : React.createElement(MonacoEditor, {
      defaultValue: files[openFile],
      defaultLanguage: langs[openExt] ?? openExt,
      path: plugin.entityID + '_' + openFile,
      saveViewState: false,

      onMount: editor => editorRef.current = editor,
      onChange: debounce(value => props.onChange(openFile, value), 500),
      theme: editorSettings.theme
    })
  );
};
})(); //# sourceURL=TopazEditor