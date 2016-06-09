// This file demonstrates where we want to be after we migrate from
// [flux](https://facebook.github.io/flux/) to
// [redux](redux.js.org). I'm annotating only what has changed from
// the "before" version.

// Everything stays the same except we additionally import `Component`, `connect`
// and `withRouter`.
import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'

import TodoList from 'components/todos/TodoList'
import LoadError from 'components/shared/LoadError'

// This is not exactly necessary or desired with bigger applications but
// we no longer use a separate action file, rather we import actions
// from `actions/index.js`.
import * as actions from 'actions';
import {getVisibleTodos, getErrorMessage, getIsFetching} from 'reducers';

// This function is almost the same except we now use `fetchTodos`
// function from the `props`. The reason is that it's better for testability
// of this component. We'll come to that later.
function loadData(props) {
  const {filter, fetchTodos} = props;
  fetchTodos(filter);
}

// We use ES6 class components. This is also not necessary but there's implication.
// We'll come to it later.
class VisibleTodoList extends Component {

  // **Note** how we no longer need `mixins` and `getStateFromFlux` here. Nice!
  // If you wonder where `propTypes` is and why it has moved, read on.

  componentDidMount() {
    loadData(this.props);
  }

  componentDidUpdate(prevProps) {
    if (this.props.filter !== prevProps.filter) {
      loadData(this.props);
    }
  }

  render() {
    // We now get the data from `props` instead of `state`. One more noticeable
    // change is that `toggleTodo` is also coming from the `props`.
    const { isFetching, errorMessage, toggleTodo, todos } = this.props;

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
}

// Now, we define `propTypes` here. This colocation next to the `mapStateToProps`
// function is good because we see what properties the component needs and thus
// we can inject these properties in the `mapStateToProps`.
VisibleTodoList.propTypes = {
  filter: PropTypes.oneOf(['all', 'active', 'completed']).isRequired,
  errorMessage: PropTypes.string,
  todos: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  fetchTodos: PropTypes.func.isRequired,
  toggleTodo: PropTypes.func.isRequired
}

// This function is basically very similar to `getStateFromFlux` except
// the `state` is now injected as a function argument. Also router `params`
// property is passed in as an argument. Note that we're also passing in
// the `filter` property. We no longer need parent to inject that property.
// Fantastic! Read on to find out where the `params` argument comes from.
const mapStateToProps = (state, {params}) => {
  const filter = params.filter || 'all'
  return {
    isFetching: getIsFetching(state, filter),
    errorMessage: getErrorMessage(state, filter),
    todos: getVisibleTodos(state, filter),
    filter,
  }
}

// The most important part is to put everything together. We first decorate
// `VisibleTodoList` with `connect()`. This generates a `Connect` component
// that listens to a single reducer store changes. It's also pure meaning that
// it only re-renders when either its `props` or `state` has changed.
//
// If it did change, the component calls `mapStateToProps` and `mapDispatchToProps`
// and merges the two resulting objects together. This forms the `props` object that will be
// passed into the `VisibleTodoList` component itself.
//
// As the last step we decorate the generated `Connect` component with `withRouter()`.
// That injects a few router related props into the `Connect` component. All of these
// own `Connect` component properties are then available as the second argument of
// `mapStateToProps` and `mapDispatchToProps` functions respectively.
VisibleTodoList = withRouter(connect(
  mapStateToProps,
  actions
)(VisibleTodoList))

export default VisibleTodoList