import { connect } from 'react-redux';
import Home from "../components/Home.js";

const mapStateToProps = (state, ownProps) => {
  return {
    header: state.Home.header,
    matches: state.Home.matches
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addMatch: ()=> {

    }
  }
}

const HomeContainer = connect(
  mapStateToProps,
)(Home)

export default HomeContainer;