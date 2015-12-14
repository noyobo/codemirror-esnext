/* eslint no-console:0 */
/**
 * @author asfdsfds
 */
import 'rc-time-picker/assets/index.css';

import React from 'react';
import ReactDom from 'react-dom';

import GregorianCalendar from 'gregorian-calendar';
import DateTimeFormat from 'gregorian-calendar-format';
import zhCn from 'gregorian-calendar/lib/locale/zh_CN';

import TimePicker from 'rc-time-picker';
import TimePickerLocale from 'rc-time-picker/lib/locale/zh_CN';

const formatter = new DateTimeFormat('HH:mm:ss');

const now = new GregorianCalendar(zhCn);
now.setTime(Date.now());

const App = React.createClass({
  getInitialState() {
    return {
      value: now,
    };
  },
  handleValueChange(value) {
    console.log(value && formatter.format(value));
    this.setState({ value });
  },
  render() {
    return (
      <div>
        <TimePicker formatter={formatter} locale={TimePickerLocale}
              defaultValue={now} />
        <TimePicker formatter={formatter} locale={TimePickerLocale}
              value={this.state.value}
              onChange={this.handleValueChange}/>
      </div>
    );
  },
});

ReactDom.render(
  <App />,
  document.getElementById('__react-content')
);


import React, { Component } from 'react';
import {PropTypes} from 'react-router';


import Loading from '../../components/loading/';
import message from '../../components/message/';
import Alert from '../../components/alert/';

export default class Task extends Component {

  constructor() {
    super(...arguments);

    this.state = {
      alert: false,
      user: false,
    };
  }

  componentWillMount() {
    const location = this.props.location;
    const params = this.props.params;

    if (location.query.repo) {
      this.rewriteFormRepo({
        repo: location.query.repo,
      });
    } else if (location.query.url) {
      this.rewriteFormUrl({
        url: location.query.url,
      });
    } else if (params && params.taskId && parseInt(params.taskId, 10) > 0) {
      base.get(API.detail({
        id: params.taskId,
      }))
      .then((res) => {
        if (res.status !== 'success') {
          this.setState({
            alert: true,
          });
        } else {
          const task = res.task;
          if (params.historyId && parseInt(params.historyId, 10) > 0) {
            this.context.history.replaceState(null, `/group/${task.projectId}/task/${task.id}/history/${params.historyId}`);
          } else {
            this.context.history.replaceState(null, `/group/${task.projectId}/task/${task.id}`);
          }
        }
      });
    } else {
      this.context.history.replaceState(null, '/group/my');
    }
  }


  rewriteFormRepo = (query) => {
    base.get(API.tasks, query)
    .then((res) => {
      if (res.status !== 'success') {
        message.show(res.status, res.message);
      } else {
        if (res.tasks && res.tasks.length !== 0) {
          const task = res.tasks[0];
          this.context.history.replaceState(null,
            '/group/' + task.projectId + '/task/' + task.id);
        } else {
          this.setState({
            alert: true,
            show: false,
            message: '暂无 ' + (query.repo || query.url) + ' 的相关测试结果',
          });
        }
      }
    });
  }

  render() {
    let renderElement = <Loading />;

    if (this.state.alert) {
      renderElement = <Alert message="未找到相关内容, 请重新输入" />;
    }

    return (
      renderElement
    );
  }
}


Task.contextTypes = { history: PropTypes.history };
