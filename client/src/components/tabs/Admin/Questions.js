import { useEffect, useContext, useState } from "react";
import AdminContext from "../../../context/admin/adminContext";
import M from "materialize-css/dist/js/materialize.min.js";
import QuestionsCard from "../../layout/QuestionsCard";
import AlertContext from "../../../context/alert/alertContext";
import Preloader from "../../layout/Preloader";

const Questions = () => {
  const adminContext = useContext(AdminContext);
  const alertContext = useContext(AlertContext);
  const [loading, setLoading] = useState(true);

  const { quesAns, loadQuesAns, updateQuiz, error } = adminContext;
  const { setAlert } = alertContext;

  const [cntChanges, setCntChanges] = useState(0);

  // Load the user when dashboard is rendered
  useEffect(() => {
    loadQuesAns();
    setLoading(false);
    M.AutoInit();
    M.updateTextFields();

    if (error) {
      setAlert(error, "danger");
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setLoading(false);
    M.AutoInit();
    M.updateTextFields();
  }, [cntChanges]);

  if (loading) {
    return <Preloader />;
  }
  if (quesAns.length === 0) {
    return <Preloader />;
  }

  let editedQuesAns = [...quesAns];

  const onSubmit = (e) => {
    e.preventDefault();

    console.log(editedQuesAns);
    updateQuiz({
      quesAns: editedQuesAns,
    });
    setAlert("Quiz Updated", "success");
  };

  return (
    <form
      className='col s12'
      style={{
        display: "flex",
        flexWrap: "nowrap",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        marginTop: "3.5em",
        width: "100%",
        height: "100%",
        marginLeft: "auto",
        marginRight: "auto",
        backgroundColor: "#2bc592",
      }}
      onSubmit={onSubmit}
    >
      {editedQuesAns.map((item, idx) => {
        return (
          <QuestionsCard
            editedQuesAns={editedQuesAns}
            key={item.ques_id}
            question={item}
            cntChanges={cntChanges}
            setCntChanges={setCntChanges}
            idx={idx}
          />
        );
      })}
      <button
        type='submit'
        className='waves-effect waves-light btn save-quiz'
        style={{
          borderRadius: "2em",
          width: "10em",
          border: "2px solid #400279",
          fontWeight: "bolder",
          fontSize: "18px",
          margin: "2em 0",
          lineHeight: "18px",
          textTransform: "capitalize",
        }}
      >
        Save
      </button>
    </form>
  );
};

export default Questions;
