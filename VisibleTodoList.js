import React, {PropTypes} from 'react'

import TodoList from 'components/todos/TodoList'
import LoadError from 'components/shared/LoadError'

import {fetchTodos, toggleTodo} from 'actions/TodoActions';
import {getVisibleTodos, getErrorMessage, getIsFetching} from 'reducers';

function loadData(props) {
  const {filter} = props
  fetchTodos(filter);
}

const VisibleTodoList = React.createClass({
  propTypes: {
    filter: PropTypes.oneOf(['all', 'active', 'completed']).isRequired
  },

  mixins: [
    StoreWatchMixin(ReducerStore),
    PureRenderMixin
  ],

  getStateFromFlux() {
    const state = ReducerStore.getState()
    const {filter} = this.props

    return {
      isFetching: getIsFetching(state, filter),
      errorMessage: getErrorMessage(state, filter),
      todos: getVisibleTodos(state, filter)
    }
  },

  componentDidMount() {
    loadData(this.props)
  },

  componentDidUpdate(prevProps) {
    if (this.props.filter !== prevProps.filter) {
      loadData(this.props)
    }
  },

  render() {
    const {isFetching, errorMessage, todos} = this.state;

    if (isFetching && !todos.length) {
      return <p>Loading...</p>;
    }

    if (errorMessage && !todos.length) {
      return <LoadError message={errorMessage} />
    }

    return (
      <TodoList todos={todos} onTodoClick={toggleTodo} />
    )
  }
})

export default VisibleTodoList
