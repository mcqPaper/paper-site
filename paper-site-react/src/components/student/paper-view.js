import PaperHeader from './paper-header';
import "./paper-view.css";
import QuestionNavigator from './question-navigator';
import QuestionView from './question-view';


function PaperView() {


  return (
    <div className="paperView">
      <QuestionNavigator />
      <div className="questionplus">
        <PaperHeader />
        <QuestionView />
      </div>
    </div>
  );
}
export default PaperView;
