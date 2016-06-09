// This file demonstrates how an intermediate step of
// [flux](https://facebook.github.io/flux/) to
// [redux](redux.js.org) migration might look like.

// At first we import 3rd party libraries.
import React, {PropTypes} from 'react'

// Followed by the child component imports.
import TodoList from 'components/todos/TodoList'
import LoadError from 'components/shared/LoadError'

// And last but not least we need import all actions, reducers,
// selectors and possibly some utilities or helpers.
import {fetchTodos, toggleTodo} from 'actions/TodoActions';
import {getVisibleTodos, getErrorMessage, getIsFetching} from 'reducers';

// Before jumping straight at the component implementation we define
// how this component fetches the data it needs. We're calling actions
// and passing in the input arguments.
function loadData(props) {
  const {filter} = props
  fetchTodos(filter);
}

// Our [container](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0) component definition.
const VisibleTodoList = React.createClass({

  // Property `filter` is going to be passed in by the parent component which
  // in most cases is a handler component also known as page component.
  // Filter is a route property obtained from the route `/:filter`.
  // We could access router through `this.context.router` and call `getCurrentParams().filter`
  // to get the filter value but in that case we wouldn't be able to receive
  // new values when the route changes because we use `PureRenderMixin` (see below).
  propTypes: {
    filter: PropTypes.oneOf(['all', 'active', 'completed']).isRequired
  },

  // The component listens to `ReducerStore` changes. Also this component
  // is [pure](https://facebook.github.io/react/docs/pure-render-mixin.html)
  // which means that it only calls `render` if either `props` or `state` has changed.
  // That's why we need `filter` be injected by the parent.
  mixins: [
    StoreWatchMixin(ReducerStore),
    PureRenderMixin
  ],


  // When the store changes state it emits the change event. As a result,
  // change event handler registered by the `StoreWatchMixin`
  // is triggered and sets the new state obtained by calling `getStateFromFlux`.
  // This function does all the wiring of the store state to this component's
  // state.
  getStateFromFlux() {
    const state = ReducerStore.getState()
    const {filter} = this.props

    return {
      isFetching: getIsFetching(state, filter),
      errorMessage: getErrorMessage(state, filter),
      todos: getVisibleTodos(state, filter)
    }
  },

  // Here we utilise the `loadData` function. Universal apps can make use of
  // the `componentWillMount` hook which is called on the client
  // AND the server whereas `*DidMount` is only called on the client.
  componentDidMount() {
    loadData(this.props)
  },

  // Here we re-load the data whenever any input that enters "the equation"
  // has changed. In this case only `filter` matters.
  componentDidUpdate(prevProps) {
    if (this.props.filter !== prevProps.filter) {
      loadData(this.props)
    }
  },

  // At the end we need to render the component's markup. We use `state`
  // that was fetched from the store. We're passing in the actions. That's
  // because `<TodoList/>` is purely presentational component that doesn't
  // do anything of what we do here. Just contains a `render` function
  // and receives everything else as a property.
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

// And export the container component.
export default VisibleTodoList
