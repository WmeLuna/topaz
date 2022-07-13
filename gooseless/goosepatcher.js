goosemod.patcher = (function (e) {
    "use strict";
    var t = () => {
      const { React: e } = goosemod.webpackModules.common,
        t = goosemod.webpackModules.findByDisplayName("FormTitle"),
        o = goosemod.webpackModules.findByProps(
          "Sizes",
          "Colors",
          "Looks",
          "DropdownSizes"
        ),
        n = goosemod.webpackModules.find(
          (e) => "Markdown" === e.displayName && e.rules
        ),
        s = goosemod.webpackModules.findByDisplayName("DropdownArrow");
      return class extends e.PureComponent {
        constructor(e) {
          super(e), (this.state = { error: !1 });
        }
        componentDidCatch(e, t) {
          console.log("honk", { error: e, moreInfo: t });
          const o = decodeURI(
              e.stack
                .split("\n")
                .filter((e) => !e.includes("/assets/"))
                .join("\n")
            ),
            n = decodeURI(t.componentStack.split("\n").slice(1, 9).join("\n")),
            s =
              o.match(/\((.*) \| GM Module:/)?.[1] ||
              n.match(/\((.*) \| GM Module:/)?.[1];
          let r = s || "Unknown";
          const a = s ? "Plugin" : "Cause";
          "Unknown" === r &&
            (o.includes("GooseMod") && (r = "GooseMod Internals"),
            (o.toLowerCase().includes("powercord") ||
              o.toLowerCase().includes("betterdiscord")) &&
              (r = "Other Mods")),
            this.setState({
              error: !0,
              suspectedCause: { name: r, type: a },
              errorStack: { raw: e.stack, useful: o },
              componentStack: { raw: t.componentStack, useful: n },
            });
        }
        render() {
          return (
            this.state.toRetry && (this.state.error = !1),
            setTimeout(() => {
              this.state.toRetry = !0;
            }, 100),
            this.state.error
              ? e.createElement(
                  "div",
                  { className: "gm-error-boundary" },
                  e.createElement(
                    "div",
                    {},
                    e.createElement("div", {}),
                    e.createElement(
                      t,
                      { tag: "h1" },
                      "GooseMod has handled an error",
                      e.createElement(
                        n,
                        {},
                        `## Suspected ${this.state.suspectedCause.type}: ${this.state.suspectedCause.name}`
                      )
                    )
                  ),
                  e.createElement(
                    "div",
                    {},
                    e.createElement(
                      o,
                      {
                        color: o.Colors.BRAND,
                        size: o.Sizes.LARGE,
                        onClick: () => {
                          (this.state.toRetry = !0), this.forceUpdate();
                        },
                      },
                      "Retry"
                    ),
                    e.createElement(
                      o,
                      {
                        color: o.Colors.RED,
                        size: o.Sizes.LARGE,
                        onClick: () => {
                          location.reload();
                        },
                      },
                      "Refresh"
                    )
                  ),
                  e.createElement(
                    "div",
                    {
                      onClick: () => {
                        (this.state.toRetry = !1),
                          (this.state.showDetails = !this.state.showDetails),
                          this.forceUpdate();
                      },
                    },
                    e.createElement(
                      "div",
                      {
                        style: {
                          transform: `rotate(${
                            this.state.showDetails ? "0" : "-90"
                          }deg)`,
                        },
                      },
                      e.createElement(s, { width: 24, height: 24 })
                    ),
                    this.state.showDetails ? "Hide Details" : "Show Details"
                  ),
                  this.state.showDetails
                    ? e.createElement(
                        "div",
                        {},
                        e.createElement(n, {}, "# Error Stack"),
                        e.createElement(
                          n,
                          {},
                          `\`\`\`\n${this.state.errorStack.useful}\n\`\`\``
                        ),
                        e.createElement(n, {}, "# Component Stack"),
                        e.createElement(
                          n,
                          {},
                          `\`\`\`\n${this.state.componentStack.useful}\n\`\`\``
                        ),
                        e.createElement(n, {}, "# Debug Info"),
                        e.createElement(
                          n,
                          {},
                          `\`\`\`\n${goosemod.genDebugInfo()}\n\`\`\``
                        )
                      )
                    : null
                )
              : this.props.children
          );
        }
      };
    };
    let o;
    const n = (e = 3) =>
        new Array(e)
          .fill(0)
          .map(() => Math.random().toString(16).substring(2))
          .join(""),
      s = {},
      r = (e, n, r, a) =>
        function (...i) {
          const c = ((e, t, o, n, r) => {
            const a = s[o][r].before;
            if (0 === a.length) return t;
            let i = t;
            for (const t of a)
              try {
                let o = t.call(e, i);
                if (!1 === o) return !1;
                Array.isArray(o) && (i = o);
              } catch (e) {
                console.error(`Before patch (${o} - ${n}) failed, skipping`, e);
              }
            return i;
          })(this, i, n, r, a);
          let l;
          if (Array.isArray(c)) {
            l = ((e, t, o, n, r, a) => {
              const i = s[n][a].after;
              let c = o;
              for (const o of i)
                try {
                  let n = o.call(e, t, c);
                  void 0 !== n && (c = n);
                } catch (e) {
                  console.error(`After patch (${n} - ${r}) failed, skipping`, e);
                }
              return c;
            })(
              this,
              c,
              ((e, t, o, n, r, a) => {
                const i = s[n][a].instead;
                if (0 === i.length) return o.apply(e, t);
                let c;
                for (const s of i)
                  try {
                    let n = s.call(e, t, o.bind(e));
                    void 0 !== n && (c = n);
                  } catch (e) {
                    console.error(
                      `Instead patch (${n} - ${r}) failed, skipping`,
                      e
                    );
                  }
                return c;
              })(this, i, e, n, r, a),
              n,
              r,
              a
            );
          }
          if (s[n][a].harden) {
            o || (o = t());
            const { React: e } = goosemod.webpackModules.common;
            return e.createElement(o, {}, l);
          }
          return l;
        },
      a = (e, t, o, i = !1, c = !1) => {
        if ("function" != typeof e[t])
          return (
            goosemod.logger.debug(
              "patcher",
              "Failed to patch as key isn't func",
              e,
              t
            ),
            () => {}
          );
        if (!e._goosemodPatcherId) {
          const t = n();
          (e._goosemodPatcherId = t), (s[t] = {});
        }
        const l = e._goosemodPatcherId,
          d = `gm-${t}`;
        if (!s[l][d]) {
          const o = e[t];
          (e[t] = Object.assign(r(o, l, t, d), o)),
            (e[t].toString = () => o.toString());
          let n = !1;
          (p = o) && (p.prototype?.render || p.displayName) && (n = !0),
            e.render && ("render" !== t ? a(e, "render", () => {}) : (n = !0)),
            o.displayName?.endsWith("Item") && (n = !1),
            (s[l][d] = {
              before: [],
              after: [],
              instead: [],
              harden: n,
              original: o,
            });
        }
        var p;
        const u = c ? "instead" : i ? "before" : "after",
          m = s[l][d][u].push(o);
        return () => {
          s[l][d][u].splice(m - 1, 1);
          ["before", "after", "instead"].every((e) => 0 === s[l][d][e].length) &&
            ((e[t] = s[l][d].original), delete e._goosemodPatcherId);
        };
      },
      i = {};
    const c = (e) => (e && e._reactInternalFiber) || e._reactInternals,
      l = (e) => {
        let t =
          (o = e) &&
          o[
            Object.keys(o).find(
              (e) =>
                e.startsWith("__reactInternalInstance") ||
                e.startsWith("__reactFiber$")
            )
          ];
        for (var o; t.return; )
          if (((t = t.return), t.stateNode?._reactInternals)) return t.stateNode;
      },
      d = (e, t, o) => {
        const { walkable: n = null, ignore: s = [] } = o ?? {};
        return e && "object" == typeof e
          ? "string" == typeof t
            ? e[t]
            : t(e)
            ? e
            : Array.isArray(e)
            ? e.map((e) => d(e, t, o)).find((e) => e)
            : (n || Object.keys(e))
                .map((n) => !s.includes(n) && d(e[n], t, o))
                .find((e) => e)
          : null;
      },
      p = (e, t) =>
        d(e, t, { walkable: ["props", "children", "child", "sibling"] });
    let u = {};
    const m = (e) => {
        u = e;
      },
      h = (e) => e.toLowerCase().replace(/ /g, "-"),
      f = (e) => `gm-cm-${e}`,
      g = (e) => {
        switch (e) {
          case "user":
            return "user-context";
          case "message":
            return "message";
          default:
            return e;
        }
      },
      y = (e) => {
        try {
          switch (e) {
            case "message":
              return c(l(document.getElementById("message"))).return.return
                .memoizedProps;
            case "message-actions":
              return c(l(document.getElementById("message-actions"))).return
                .return.memoizedProps;
            case "user-context":
              return c(l(document.getElementById("user-context"))).return.return
                .return.return.return.return.memoizedProps;
            default:
              return;
          }
        } catch (e) {
          return;
        }
      },
      b = (e, t, o, n, s, { Menu: r, React: a }) => {
        const i = void 0 !== e.checked;
        e.id = e.id || h(e.label);
        let c = t;
        "function" == typeof c && (c = c()),
          c &&
            (c = c.map(
              (e) => (e.originalAction || (e.originalAction = e.action), e)
            )),
          (e.action = function () {
            return i
              ? ((e.checked = !e.checked),
                (p.props.checked = e.checked),
                l(
                  document.querySelector(`[id^="${o}-"][id*="${e.id}"]`)
                ).props.onMouseEnter(),
                e.originalAction(arguments, s, e.checked))
              : e.originalAction(arguments, s);
          });
        const d = i ? r.MenuCheckboxItem : r.MenuItem,
          p =
            void 0 !== c
              ? a.createElement(
                  d,
                  e,
                  ...c.map((e) => b(e, e.sub, o, n, s, { Menu: r, React: a }))
                )
              : a.createElement(d, e);
        return p;
      },
      M = (e, t) => {
        const { React: o } = u.webpackModules.common,
          n = u.webpackModules.findByProps("MenuItem"),
          s = g(e);
        return (
          (t.originalAction = t.action),
          a(
            n,
            "default",
            (r) => {
              if (r.length < 1) return;
              const [{ navId: a, children: i }] = r;
              if (a !== s && ("message" !== s || "message-actions" !== a))
                return r;
              if (p(i, (e) => e?.props?.id === (t.id || h(t.label)))) return r;
              const c = Object.assign({}, t),
                l = b(c, c.sub, s, e, Object.assign({}, y(a)), {
                  Menu: n,
                  React: o,
                });
              let d = p(i, (e) => e && e.props && !0 === e.props.goosemod);
              return (
                d
                  ? (Array.isArray(d.props.children) ||
                      (d.props.children = [d.props.children]),
                    d.props.children.push(l))
                  : ((d = o.createElement(n.MenuGroup, { goosemod: !0 }, l)),
                    i.push([o.createElement(n.MenuSeparator), d])),
                r
              );
            },
            !0
          )
        );
      },
      k = {};
    let w = {};
    const B = (e) => {
      w = e;
    };
    let E = {};
    const _ = (e) => {
      E = e;
    };
    let v,
      S = {};
    const I = (e) => {
        (S = e),
          (v = S.webpackModules.findByProps(
            "BUILT_IN_COMMANDS",
            "BUILT_IN_SECTIONS"
          ));
        const { React: t } = S.webpackModules.common,
          o = goosemod.webpackModules.findByProps("getIconComponent"),
          n = goosemod.webpackModules.find(
            (e) => "ApplicationCommandItem" === e.default?.displayName
          ),
          s = goosemod.webpackModules.findByProps("useSearchManager"),
          r = { id: C, type: 0, name: "GooseMod" };
        goosemod.patcher.patch(o, "getIconComponent", ([e]) => {
          if (e.id === C)
            return (e) =>
              t.createElement(
                "div",
                {
                  className: "wrapper-1wwiGV selectable-fgiA2c",
                  style: {
                    width: e.width,
                    height: e.height,
                    padding: e.padding ?? 0,
                  },
                },
                t.createElement("img", {
                  src: "https://goosemod.com/img/logo.jpg",
                  style: {
                    width: e.width,
                    height: e.height,
                    borderRadius: "50%",
                  },
                  className: "icon-1kx1ir",
                })
              );
        }),
          goosemod.patcher.patch(
            n,
            "default",
            ([{ command: e }], o) => (
              e.applicationId === C &&
                (o.props.children[0] = t.createElement(
                  "div",
                  {
                    className: "wrapper-3t15Cn image-1a_IXB",
                    style: { width: 32, height: 32 },
                  },
                  t.createElement("img", {
                    src: "https://goosemod.com/img/logo.jpg",
                    style: { width: 32, height: 32, borderRadius: "50%" },
                    className: "icon-1kx1ir",
                  })
                )),
              o
            )
          ),
          goosemod.patcher.patch(s, "useSearchManager", (e, t) => {
            const o = Object.values(v.BUILT_IN_COMMANDS).filter(
              (e) => e.applicationId === C
            );
            if (0 === o.length) return t;
            t.activeSections.find((e) => e.id === r.id) ||
              t.activeSections.push(r),
              t.sectionDescriptors.find((e) => e.id === r.id) ||
                t.sectionDescriptors.push(r);
            let n = t.commandsByActiveSection.find((e) => e.section.id === r.id);
            if (
              (n
                ? (n.data = o)
                : (null != t.filteredSectionId && t.filteredSectionId !== C) ||
                  t.commandsByActiveSection.push({ section: r, data: o }),
              t.commandsByActiveSection.find((e) => "-1" === e.section.id))
            ) {
              const e = t.commandsByActiveSection.find(
                (e) => "-1" === e.section.id
              );
              e.data = e.data.filter((e) => e.applicationId !== C);
            }
            return t;
          });
      },
      C = "-3";
    let N = {};
    const A = (e) => {
      N = e;
      const { BOT_AVATARS: t } = N.webpackModules.findByProps(
        "BOT_AVATARS",
        "DEFAULT_AVATARS"
      );
      t.GooseMod =
        "https://cdn.discordapp.com/avatars/760559484342501406/5125aff2f446ad7c45cf2dfd6abf92ed.webp";
    };
    var T = (e) => new Promise((t) => setTimeout(t, e));
    let x,
      P = [],
      R = {};
    const D = async (e) => {
      R = e;
      const t = R.webpackModules.findByProps("base", "sidebar");
      for (; void 0 === document.getElementsByClassName(t.base)[0]; ) await T(10);
      const o = l(document.getElementsByClassName(t.base)[0]),
        { React: n } = R.webpackModules.common;
      class s extends n.PureComponent {
        constructor(e) {
          super(e), (this._updateCall = () => this.forceUpdate());
        }
        componentDidMount() {
          x = this._updateCall;
        }
        componentWillUnmount() {}
        render() {
          return P.length > 0 ? P.shift().react : null;
        }
      }
      a(
        o.props.children[0],
        "type",
        (e, t) => (
          t.props.children[1].props.children[1].props.children.props.children.unshift(
            n.createElement(s)
          ),
          t
        )
      ),
        o.forceUpdate();
    };
    let L = {};
    const $ = (e) => {
      L = e;
    };
    let j = {};
    const U = (e) => {
      j = e;
    };
    const O = (e) => {};
    let G = {};
    const z = (e) => {
      G = e;
    };
    const q = {
        __proto__: null,
        setThisScope: m,
        labelToId: h,
        getInjectId: f,
        patchTypeToNavId: g,
        getExtraInfo: y,
        patch: M,
        add: (e, t) => {
          k[f(t.id || h(t.label))] = M(e, t);
        },
        remove: (e) => {
          const t = f(h(e));
          return !!k[t] && (k[t](), !0);
        },
      },
      F = {
        __proto__: null,
        setThisScope: B,
        patch: (e, t, o) => {
          const { React: n } = w.webpackModules.common,
            s = w.webpackModules.findByDisplayName("Tooltip"),
            { icon: r } = w.webpackModules.findByProps("icon", "isHeader"),
            i = w.webpackModules.find(
              (e) => e.default && "MiniPopover" === e.default.displayName
            );
          return a(i, "default", (a, c) => {
            const l = p(c, (e) => e && e.message);
            return l
              ? (c.props.children.unshift(
                  n.createElement(
                    s,
                    { position: "top", text: e },
                    ({ onMouseLeave: e, onMouseEnter: s }) =>
                      n.createElement(
                        i.Button,
                        {
                          onClick: () => {
                            o(l);
                          },
                          onMouseEnter: s,
                          onMouseLeave: e,
                        },
                        "string" != typeof t
                          ? t
                          : n.createElement("img", {
                              src: t,
                              width: "24px",
                              height: "24px",
                              className: r,
                            })
                      )
                  )
                ),
                c)
              : c;
          });
        },
      },
      W = {
        __proto__: null,
        setThisScope: _,
        patch: (
          e,
          t,
          o,
          { inUpload: n = !1, inReadonlyChannels: s = !1 } = {}
        ) => {
          const { React: r } = E.webpackModules.common,
            i = E.webpackModules.findByDisplayName("Tooltip"),
            c = E.webpackModules.findByProps("Looks", "DropdownSizes"),
            l = E.webpackModules.findByProps("button"),
            d = E.webpackModules.findByProps("buttonWrapper", "pulseButton"),
            u = E.webpackModules.findByProps("button", "textArea"),
            m = E.webpackModules.find(
              (e) =>
                e.type &&
                e.type.render &&
                "ChannelTextAreaContainer" === e.type.render.displayName
            );
          return a(m.type, "render", (a, m) => {
            const h = p(
              m,
              (e) => e && e.className && 0 === e.className.indexOf("buttons-")
            );
            return (
              !h ||
                (!n &&
                  !0 ===
                    m.props.children[0].ref.current?.classList?.contains(
                      "channelTextAreaUpload-3t7EIx"
                    )) ||
                (!s &&
                  !0 ===
                    m.props.children[0].ref.current?.classList?.contains(
                      "channelTextAreaDisabled-8rmlrp"
                    )) ||
                h.children.unshift(
                  r.createElement(
                    "div",
                    null,
                    r.createElement(
                      i,
                      { position: "top", text: e },
                      ({ onMouseLeave: e, onMouseEnter: n }) =>
                        r.createElement(
                          c,
                          {
                            look: c.Looks.BLANK,
                            size: c.Sizes.ICON,
                            onClick: () => {
                              o(h);
                            },
                            onMouseEnter: n,
                            onMouseLeave: e,
                          },
                          "string" != typeof t
                            ? t
                            : r.createElement("img", {
                                src: t,
                                width: "24px",
                                height: "24px",
                                className: `${u.button} ${l.contents} ${d.button}`,
                              })
                        )
                    )
                  )
                ),
              m
            );
          });
        },
      },
      V = {
        __proto__: null,
        setThisScope: I,
        add: (e, t, o, n = []) => {
          v.BUILT_IN_COMMANDS.push({
            applicationId: C,
            type: 1,
            inputType: 0,
            description: t,
            name: e,
            displayName: e,
            displayDescription: t,
            execute: o,
            options: n,
            id: `-${Math.random().toString().split(".")[1].substring(0, 5)}`,
          });
        },
        remove: (e) => {
          const t = v;
          t.BUILT_IN_COMMANDS = t.BUILT_IN_COMMANDS.filter((t) => t.name !== e);
        },
      },
      H = (e, t = "GooseMod") => {
        const { createBotMessage: o } =
            N.webpackModules.findByProps("createBotMessage"),
          { getChannelId: n } = N.webpackModules.findByProps(
            "getChannelId",
            "getVoiceChannelId"
          ),
          { receiveMessage: s } = N.webpackModules.findByProps(
            "receiveMessage",
            "sendBotMessage"
          ),
          r = o(n(), "");
        "string" == typeof e ? (r.content = e) : r.embeds.push(e),
          (r.state = "SENT"),
          (r.author.id = "1"),
          (r.author.bot = !0),
          (r.author.discriminator = "0000"),
          (r.author.avatar = "GooseMod"),
          (r.author.username = t),
          s(n(), r);
      },
      J = {
        __proto__: null,
        get notices() {
          return P;
        },
        setThisScope: D,
        patch: (e, t, o, s = "brand") => {
          const r = R.webpackModules.findByProps("colorDanger", "notice")[
              `color${s[0].toUpperCase() + s.substring(1).toLowerCase()}`
            ],
            a = R.webpackModules.findByProps("NoticeCloseButton", "NoticeButton"),
            { React: i } = R.webpackModules.common,
            c = n(),
            l = i.createElement(
              a.default,
              { class: "goosemod-notice", id: c, color: r },
              i.createElement(a.NoticeCloseButton, {
                onClick: () => {
                  (P = P.filter((e) => e.id !== c)), x();
                },
              }),
              e,
              i.createElement(
                a.NoticeButton,
                {
                  onClick: () => {
                    o();
                  },
                },
                t
              )
            );
          P.push({ react: l, id: c }), x();
        },
      },
      K = {
        __proto__: null,
        setThisScope: $,
        patch: (
          e,
          t,
          o,
          { atEnd: n = !1, showWhere: s = ["dm", "channel"] } = {}
        ) => {
          const { React: r } = L.webpackModules.common,
            i = goosemod.webpackModules.findByProps(
              "title",
              "themed",
              "icon",
              "icon",
              "iconBadge"
            ),
            c = L.webpackModules.find(
              (e) => e.default && "HeaderBar" === e.default.displayName
            );
          return a(c, "default", (a, l) => {
            const d =
              l.props.children.props.children[1].props.children.props.children;
            let p = "other";
            if (null === d[1]) p = "home";
            else
              switch (d[0][1].key) {
                case "mute":
                  p = "channel";
                  break;
                case "calls":
                  p = "dm";
              }
            return s.includes(p)
              ? (d[n ? "push" : "unshift"](
                  r.createElement(c.Icon, {
                    "aria-label": e,
                    tooltip: e,
                    disabled: !1,
                    showBadge: !1,
                    selected: !1,
                    icon: () =>
                      "string" != typeof t
                        ? t
                        : r.createElement("img", {
                            src: t,
                            width: "24px",
                            height: "24px",
                            className: `${i}.icon`,
                          }),
                    onClick: () => {
                      o();
                    },
                  })
                ),
                l)
              : l;
          });
        },
      },
      X = {
        __proto__: null,
        setThisScope: U,
        patch: (e, t, o, n = () => {}, { round: s = !1 } = {}) => {
          const { React: r } = j.webpackModules.common,
            i = j.webpackModules.findByDisplayName("Tooltip"),
            c = j.webpackModules.findByDisplayName("Clickable"),
            l = j.webpackModules.findByProps("profileBadge24", "profileBadge22"),
            d = j.webpackModules.find(
              (e) => e.default && "UserProfileBadgeList" === e.default.displayName
            );
          return a(d, "default", ([{ user: a, size: d }], p) => {
            if (!o().includes(a.id)) return p;
            let u = l.profileBadge24;
            switch (d) {
              case 1:
                u = l.profileBadge22;
                break;
              case 2:
                u = l.profileBadge18;
            }
            return (
              p.props.children.unshift(
                r.createElement(
                  i,
                  { position: "top", text: e },
                  ({ onMouseLeave: e, onMouseEnter: o }) =>
                    r.createElement(
                      c,
                      {
                        onClick: () => {
                          n();
                        },
                        onMouseEnter: o,
                        onMouseLeave: e,
                      },
                      r.createElement("div", {
                        style: {
                          backgroundImage: `url("${t}")`,
                          borderRadius: s ? "50%" : "",
                        },
                        className: `${l.profileBadge} ${u}`,
                      })
                    )
                )
              ),
              p
            );
          });
        },
      },
      Y = {
        __proto__: null,
        setThisScope: O,
        patch: (e, { before: t = !1 } = {}) => {
          const o = goosemod.webpackModules.find(
              (e) =>
                e.default &&
                "function" == typeof e.default &&
                e.default.toString().includes("e.hideTag")
            ),
            { React: n } = goosemod.webpackModules.common;
          return a(o, "default", ([o], s) => {
            const r = e(o);
            if (!r || "" === r.props.children) return;
            const a = n.createElement("span", {
              style: { width: "5px", display: "inline-block" },
            });
            return (
              delete r.props.style.marginLeft,
              delete r.props.style.marginRight,
              t ? s.props.children.unshift(r, a) : s.props.children.push(a, r),
              s
            );
          });
        },
      },
      Z = {
        __proto__: null,
        setThisScope: z,
        patch: (e, t, o, n = () => {}, { round: s = !1 } = {}) => {
          const { React: r } = G.webpackModules.common,
            i = G.webpackModules.findByDisplayName("Tooltip"),
            c = G.webpackModules.findByDisplayName("Clickable"),
            l = G.webpackModules.findByProps(
              "guildIconContainer",
              "iconTierNone"
            ),
            d = goosemod.webpackModules.findByProps("AnimatedBanner");
          return a(d.default, "type", function (d, p) {
            if (!o().includes(d[0]?.guild?.id)) return p;
            const u = p.props.children[0].props.children[0];
            u.__injected ||
              (a(u, "type", function (o, a) {
                return (
                  a.props.children.unshift(
                    r.createElement(
                      i,
                      { position: "top", text: e },
                      ({ onMouseLeave: e, onMouseEnter: o }) =>
                        r.createElement(
                          c,
                          {
                            onClick: () => {
                              n();
                            },
                            onMouseEnter: o,
                            onMouseLeave: e,
                          },
                          r.createElement("div", {
                            style: {
                              backgroundImage: `url("${t}")`,
                              borderRadius: s ? "50%" : "",
                              width: "16px",
                              height: "16px",
                              backgroundRepeat: "no-repeat",
                              backgroundSize: "contain",
                              backgroundPosition: "50%",
                              objectFit: "cover",
                            },
                            className: `${l.guildIconContainer}`,
                          })
                        )
                    )
                  ),
                  a
                );
              }),
              (u.__injected = !0));
          });
        },
      };
    return (
      (e.channelTextAreaButtons = W),
      (e.commands = V),
      (e.contextMenu = q),
      (e.guildBadges = Z),
      (e.headerBarButtons = K),
      (e.inject = (e, t, o, n, s = !1) => {
        i[e] = a(t, o, n, s);
      }),
      (e.internalMessage = H),
      (e.miniPopover = F),
      (e.notices = J),
      (e.patch = a),
      (e.setThisScope = (e) => {
        for (const t of [m, B, _, I, A, D, $, U, O, z])
          try {
            t(e);
          } catch (e) {
            console.error("[GooseMod] Failed to scope patcher module", e, t);
          }
      }),
      (e.simpleTooltip = () => {
        const { React: e } = goosemod.webpackModules.common,
          t = goosemod.webpackModules.findByProps(
            "tooltipBottom",
            "tooltipRight"
          );
        return class extends e.PureComponent {
          constructor(e) {
            super(e),
              (this.props.position = this.props.position.toLowerCase()),
              (this.state = {});
          }
          render() {
            return this.props.children({
              onMouseEnter: async () => {
                document.querySelector(".gm-tooltip") &&
                  document.querySelector(".gm-tooltip").remove();
                let e = document.createElement("div");
                document
                  .querySelectorAll(".layerContainer-2v_Sit")[1]
                  .appendChild(e);
                const o = document
                  .querySelector(`.gm-tooltipref-${this.state.refId}`)
                  .getBoundingClientRect();
                (e.outerHTML = `<div class="layer-2aCOJ3 disabledPointerEvents-2AmYRc gm-tooltip" style="position: absolute; top: -1000px; left: -1000px;"><div class="${
                  t[
                    `tooltip${
                      this.props.position[0].toUpperCase() +
                      this.props.position.substring(1)
                    }`
                  ]
                } tooltip-14MtrL tooltipPrimary-3qLMbS tooltipDisablePointerEvents-1huO19" style="opacity: 1; transform: none;"><div class="tooltipPointer-3L49xb"></div><div class="tooltipContent-Nejnvh tooltip-1j5_GT text-sm-normal-3Zj3Iv">${
                  this.props.text
                }</div></div></div>`),
                  (e = document.querySelector(".gm-tooltip"));
                const n = e.getBoundingClientRect();
                switch (this.props.position) {
                  case "top":
                    (e.style.left = o.left + o.width / 2 - n.width / 2 + "px"),
                      (e.style.top = o.top - n.height - 8 + "px");
                    break;
                  case "left":
                    (e.style.left = o.left - n.width - 8 + "px"),
                      (e.style.top = o.top + o.height / 2 - n.height / 2 + "px");
                }
              },
              onMouseLeave: () => {
                document.querySelector(".gm-tooltip") &&
                  document.querySelector(".gm-tooltip").remove();
              },
              text: this.props.text,
              className: `gm-tooltipref-${(this.state.refId = Math.random()
                .toString()
                .split(".")[1])}`,
            });
          }
        };
      }),
      (e.uninject = (e) => !!i[e] && (i[e](), !0)),
      (e.userBadges = X),
      (e.username = Y),
      Object.defineProperty(e, "__esModule", { value: !0 }),
      e
    );
  })({}); //# sourceURL=GooseModPatcher
  