import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const CounUsers = ({ users, setActive, active }) => {
  const [clickedOn, setClickedOn] = useState(active);

  useEffect(() => {
    setActive(clickedOn);
    // eslint-disable-next-line
  }, [clickedOn]);

  useEffect(() => {
    setClickedOn(active);
  }, [active]);

  const scrollToBottom = () => {
    const elem = document.getElementById("messagesEndCoun");
    if (elem) {
      elem.scrollIntoView({ behavior: "auto" });
    }
  };

  const onClick = (id) => {
    setClickedOn(id);
    setTimeout(scrollToBottom, 10);
  };

  return (
    <div
      style={{
        width: "200px",
        height: "auto",
        margin: "0",
        display: "flex",
        flexWrap: "nowrap",
        flexDirection: "column",
        border: "2px solid",
        padding: "0",
        justifyContent: "flex-start",
        alignItems: "center",
        flexGrow: "initial",
      }}
    >
      {users.map((stud) => {
        return (
          <button
            key={stud.stud_id}
            onClick={() => onClick(stud.stud_id)}
            className={
              clickedOn === stud.stud_id ? "chatUsers chatActive" : "chatUsers"
            }
          >
            {stud.stud_name}
          </button>
        );
      })}
    </div>
  );
};

// Set proptypes
CounUsers.propTypes = {
  users: PropTypes.array.isRequired,
  setActive: PropTypes.func.isRequired,
};

export default CounUsers;
