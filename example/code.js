var code = '/* eslint no-console:0 */\n/**\n * @author asfdsfds\n */\nimport \'rc-time-picker/assets/index.css\';\n\nimport React from \'react\';\n\nconst now = new GregorianCalendar(zhCn);\nnow.setTime(Date.now());\n\nconst App = React.createClass({\n  getInitialState() {\n    return {\n      value: now,\n    };\n  },\n  handleValueChange(value) {\n    this.setState({ value });\n  },\n  render() {\n    return (\n      <div>\n        \n      </div>\n    );\n  },\n});\n'


// code = '/* eslint no-console:0 */\n/**\n * @author asfdsfds\n */\nimport \'rc-time-picker/assets/index.css\';\n\nimport React from \'react\';\nimport ReactDom from \'react-dom\';\n\nimport GregorianCalendar from \'gregorian-calendar\';\nimport DateTimeFormat from \'gregorian-calendar-format\';\nimport zhCn from \'gregorian-calendar/lib/locale/zh_CN\';\n\nimport TimePicker from \'rc-time-picker\';\nimport TimePickerLocale from \'rc-time-picker/lib/locale/zh_CN\';\n\nconst formatter = new DateTimeFormat(\'HH:mm:ss\');\n\nconst now = new GregorianCalendar(zhCn);\nnow.setTime(Date.now());\n\nconst App = React.createClass({\n  getInitialState() {\n    return {\n      value: now,\n    };\n  },\n  handleValueChange(value) {\n    console.log(value && formatter.format(value));\n    this.setState({ value });\n  },\n  render() {\n    return (\n      <div>\n        <TimePicker formatter={formatter} locale={TimePickerLocale}\n              defaultValue={now} />\n        <TimePicker formatter={formatter} locale={TimePickerLocale}\n              value={this.state.value}\n              onChange={this.handleValueChange}/>\n      </div>\n    );\n  },\n});\n\nReactDom.render(\n  <App />,\n  document.getElementById(\'__react-content\')\n);\n\n\nimport React, { Component } from \'react\';\nimport {PropTypes} from \'react-router\';\n\n\nimport Loading from \'../../components/loading/\';\nimport message from \'../../components/message/\';\nimport Alert from \'../../components/alert/\';\n\nexport default class Task extends Component {\n\n  constructor() {\n    super(...arguments);\n\n    this.state = {\n      alert: false,\n      user: false,\n    };\n  }\n\n  componentWillMount() {\n    const location = this.props.location;\n    const params = this.props.params;\n\n    if (location.query.repo) {\n      this.rewriteFormRepo({\n        repo: location.query.repo,\n      });\n    } else if (location.query.url) {\n      this.rewriteFormUrl({\n        url: location.query.url,\n      });\n    } else if (params && params.taskId && parseInt(params.taskId, 10) > 0) {\n      base.get(API.detail({\n        id: params.taskId,\n      }))\n      .then((res) => {\n        if (res.status !== \'success\') {\n          this.setState({\n            alert: true,\n          });\n        } else {\n          const task = res.task;\n          if (params.historyId && parseInt(params.historyId, 10) > 0) {\n            this.context.history.replaceState(null, `/group/${task.projectId}/task/${task.id}/history/${params.historyId}`);\n          } else {\n            this.context.history.replaceState(null, `/group/${task.projectId}/task/${task.id}`);\n          }\n        }\n      });\n    } else {\n      this.context.history.replaceState(null, \'/group/my\');\n    }\n  }\n\n\n  rewriteFormRepo = (query) => {\n    base.get(API.tasks, query)\n    .then((res) => {\n      if (res.status !== \'success\') {\n        message.show(res.status, res.message);\n      } else {\n        if (res.tasks && res.tasks.length !== 0) {\n          const task = res.tasks[0];\n          this.context.history.replaceState(null,\n            \'/group/\' + task.projectId + \'/task/\' + task.id);\n        } else {\n          this.setState({\n            alert: true,\n            show: false,\n            message: \'暂无 \' + (query.repo || query.url) + \' 的相关测试结果\',\n          });\n        }\n      }\n    });\n  }\n\n  render() {\n    let renderElement = <Loading />;\n\n    if (this.state.alert) {\n      renderElement = <Alert message="未找到相关内容, 请重新输入" />;\n    }\n\n    return (\n      renderElement\n    );\n  }\n}\n\n\nTask.contextTypes = { history: PropTypes.history };\n'