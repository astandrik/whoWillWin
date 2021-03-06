import React from "react";
import {updateTask, deleteTask} from "../../redux/actions/actions";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import ReactSVG from 'react-svg'
import {getTasks, resolvePositions, toggleDragged, setCoords, updateTaskPosition} from "../../redux/actions/actions";
import TaskElem from "./TaskElem";
import helpers from "../../helperFunctions/helpers";
import _ from "lodash";


function getThresholds(refs) {
  return refs.map(x => ({top: x.ref.offsetTop, bottom: x.ref.offsetTop + x.ref.offsetHeight, id: x.id}))
}

function getBorders(elem, parent) {
  return {
    top: elem.offsetTop - parent.scrollTop,
    bottom: elem.offsetTop - parent.scrollTop + elem.offsetHeight,
    left: elem.offsetLeft,
    right: elem.offsetLeft + elem.offsetWidth
  }
}

function processScroll(parentFunc, diff) {
  let parent = parentFunc();
  parent.scrollTop += diff;
}

class TasksList extends React.Component {
  constructor(props) {
    super(props);
    this.props.initLoad();
    this.state = {
      posX: 0,
      posY: 0,
      dragged: false,
      draggedId: -1,
      draggedPosition: -1,
      currentBorders: {}
    };
    this.move=this.move.bind(this);
    this.resolvePositions = helpers.debounce(this.resolvePositions.bind(this),100);
  }
  resolvePositions(tasks) {
    let refs = [];
    let draggedId = this.state.draggedId;
    this.props.tasks.allIds.filter(x => x !== this.state.draggedId)
        .forEach(x => refs.push({id: x, ref: this.refs["elem-"+x].wrappedInstance.refs["task-element"+x]}));
    let thresholds = getThresholds(refs).sort((a,b) => a.top - b.top);
    let i = 0;
    let shadowRef = this.refs["elem-"+draggedId].wrappedInstance.refs["shadow"];
    if(shadowRef) {
      let direction = tasks.byId[draggedId].posY - tasks.byId[draggedId].prevY > 0 ? "down" : "up";
      if(direction === "down") {
        while(thresholds[i] && (tasks.byId[draggedId].borders.bottom+this.refs["tasks"].scrollTop  > thresholds[i].top)) {          
          i++;
        }
      } else {
        while(thresholds[i] && (tasks.byId[draggedId].borders.top + this.refs["tasks"].scrollTop  > thresholds[i].bottom)) {
          i++;
        }
      }
      let positionedIds = [];
      for(let j = 0; j < i; j++) {
        positionedIds.push(thresholds[j].id);
      }
      positionedIds.push(draggedId);
      let draggedPosition = positionedIds.length;
      for(let j = i; j < thresholds.length; j++) {
        positionedIds.push(thresholds[j].id);
      }
      this.setState({draggedPosition});
      this.props.resolvePositions({positionedIds});
    }
  }
  makeStatic(id,e) {
    e.preventDefault();
    this.props.toggleDragged({id: id, flag: false, posX: e.pageX, posY: e.pageY});
    this.setState({dragged: false, draggedId: id});
    this.props.updateTaskPosition({id: this.state.draggedId, position: this.state.draggedPosition});
  }
  makeDragged(id,e) {
    let name = e.target.getAttribute("name");
    if(name && ~name.indexOf("task-card")) {
      let elem =  this.refs["elem-"+id].wrappedInstance.refs["task-element"+id];
      let currentBorders = getBorders(elem, this.refs["tasks"]);
      this.props.toggleDragged({id: id, flag: true, posX: e.pageX, posY: e.pageY, borders: currentBorders});
      this.setState({dragged: true, draggedId: id});
    }
  }
  move(e) {
    if(!this.state.dragged) return;
    e.preventDefault();
    this.props.setCoords({
      posX: e.pageX,
      posY: e.pageY,
      id: this.state.draggedId
    });
    this.resolvePositions(this.props.tasks);
  }
  shouldComponentUpdate(nextProps) {
    if(_.isEqual(this.props.tasks.allIds, nextProps.tasks.allIds)) return false;
    return true;
  }
  render() {
    let props = this.props;
    let tasks = props.tasks;
    let tasksList = tasks.allIds.map(id => {
      return <TaskElem
        ref={"elem-"+id}
        key={id}
        objid={id}
        makeDragged={this.makeDragged.bind(this,id)}
        makeStatic={this.makeStatic.bind(this,id)}
        processScroll={processScroll.bind(this, () => this.refs["tasks"])}
        parent={() => this.refs["tasks"]}
        update={props.updateTask}
        delete={props.deleteTask}/>
    });
    return (
      <div className="tasks-container" onMouseMove={this.move}>
        <div className="tasks" ref="tasks">
          {tasksList}
        </div>
      </div>
    )
  }
}

let mapStateToProps = (state) => {
  return {
    tasks: state.Tasks.tasks
  }
}

let mapDispatchToProps = (dispatch) => {
  return {
    updateTask(task) {
      dispatch(updateTask(task));
    },
    deleteTask(id) {
      dispatch(deleteTask(id));
    },
    initLoad() {
      dispatch(getTasks());
    },
    updateTaskPosition(task) {
      dispatch(updateTaskPosition(task));
    },
    resolvePositions(tasks) {
      dispatch(resolvePositions(tasks));
    },
    toggleDragged(obj) {
      dispatch(toggleDragged(obj));
    },
    setCoords(coords) {
      dispatch(setCoords(coords));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TasksList);