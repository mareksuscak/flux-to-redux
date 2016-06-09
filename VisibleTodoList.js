import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'

import TodoList from 'components/todos/TodoList'
import LoadError from 'components/shared/LoadError'

import * as actions from 'actions'
import {getVisibleTodos, getErrorMessage, getIsFetching} from 'reducers'

function loadData(props) {
  const {filter, fetchTodos} = props
  fetchTodos(filter)
}

class VisibleTodoList extends Component {
  componentDidMount() {
    loadData(this.props)
  }

  componentDidUpdate(prevProps) {
    if (this.props.filter !== prevProps.filter) {
      loadData(this.props)
    }
  }

  render() {
    const { isFetching, errorMessage, toggleTodo, todos } = this.props

    if (isFetching && !todos.length) {
      return <p>Loading...</p>
    }

    if (errorMessage && !todos.length) {
      return <LoadError message={errorMessage} />
    }

    return (
      <TodoList todos={todos} onTodoClick={toggleTodo} />
    )
  }
}

VisibleTodoList.propTypes = {
  filter: PropTypes.oneOf(['all', 'active', 'completed']).isRequired,
  errorMessage: PropTypes.string,
  todos: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  fetchTodos: PropTypes.func.isRequired,
  toggleTodo: PropTypes.func.isRequired
}

const mapStateToProps = (state, {params}) => {
  const filter = params.filter || 'all'
  return {
    isFetching: getIsFetching(state, filter),
    errorMessage: getErrorMessage(state, filter),
    todos: getVisibleTodos(state, filter),
    filter,
  }
}

VisibleTodoList = withRouter(connect(
  mapStateToProps,
  actions
)(VisibleTodoList))

export default VisibleTodoList
