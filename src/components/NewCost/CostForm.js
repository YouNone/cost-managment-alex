import { useContext, useEffect, useState } from "react";
import styles from "./CostForm.module.css";
import { v4 as uuidv4 } from "uuid";
import ErrorModal from "../UI/ErrorModal";
import Button from "../UI/Button";
import ConstContext from "../context/CostContext";
import Input from "../UI/Input/Input";

function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

function CostForm(props) {
  const [inputName, setInputName] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [inputDate, setInputDate] = useState("");

  const [isPending, setPending] = useState(false);
  const [inputIsOpened, setInputIsOpened] = useState(false);
  const [error, setError] = useState(undefined);

  const [isNameValid, setNameValid] = useState(true);
  const [isCostValid, setCostValid] = useState(true);
  const [isDateValid, setDateValid] = useState(true);

  const curDate = new Date().toJSON().slice(0, 10);
  const minDate = new Date("2019-12-31");
  const cntx = useContext(ConstContext);

  useEffect(() => {
    if (props.costToUpdate) {
      setInputName(props.costToUpdate.description);
      setInputAmount(props.costToUpdate.amount);
      setInputDate(formatDate(props.costToUpdate.date));
      setInputIsOpened(true);
    }
  }, [props.costToUpdate]);

  useEffect(() => {
    if (props.clearFields) {
      setInputName("");
      setInputAmount("");
      setInputDate("");
      setInputIsOpened(false);
    }
  }, [props.clearFields]);

  const NameChangeHandler = (event) => {
    if (event.target.value.trim().length > 0) {
      setNameValid(true);
    }
    setInputName(event.target.value);
  };

  const AmountChangeHandler = (event) => {
    if (event.target.value.trim().length > 0) {
      setCostValid(true);
    }
    setInputAmount(event.target.value);
  };

  const DateChangeHandler = (event) => {
    if (event.target.value.trim().length > 0) {
      setDateValid(true);
    }
    setInputDate(event.target.value);
  };

  const ErrorHandler = () => {
    setError(false);
  };

  function sendCost() {
    if (props.costToUpdate && inputName && inputAmount && inputDate) {
      const costData = {
        description: inputName,
        amount: inputAmount,
        date: new Date(inputDate),
        id: props.costToUpdate.id,
      };

      setPending(true);
      fetch("http://localhost:8000/costs/" + props.costToUpdate.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(costData),
      }).then(() => {
        console.log("PATCH", costData);
        setPending(false);
      });
      cntx.patchCostHandler(costData);
      setInputName("");
      setInputAmount("");
      setInputDate("");
      setInputIsOpened(false);
    } else {
      if (inputName && inputAmount && inputDate) {
        const costData = {
          description: inputName,
          amount: inputAmount,
          date: new Date(inputDate),
          id: uuidv4(),
        };

        setPending(true);

        fetch("http://localhost:8000/costs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(costData),
        }).then(() => {
          console.log("POST", costData);
          setPending(false);
        });
        cntx.addCostHandler(costData);
        setInputName("");
        setInputAmount("");
        setInputDate("");
        setInputIsOpened(false);
      }
    }
  }

  function validateForm() {
    switch (true) {
      case inputName.trim().length === 0 &&
        inputAmount.trim().length === 0 &&
        inputDate.trim().length === 0:
        setNameValid(false);
        setCostValid(false);
        setDateValid(false);
        setError({
          title: "incorrect input: Empty form",
          message: "Form cannot be empty",
        });
        break;

      case inputName.trim().length === 0 && inputAmount.trim().length === 0:
        setNameValid(false);
        setCostValid(false);
        setError({
          title: "incorrect input: empty fields",
          message: "Form fields 'Name' & 'Cost' cannot be empty",
        });
        break;

      case inputAmount.trim().length === 0 && inputDate.trim().length === 0:
        setCostValid(false);
        setDateValid(false);
        setError({
          title: "incorrect input: empty fields",
          message: "Form fields 'Cost' & 'Date' cannot be empty",
        });
        break;

      case inputName.trim().length === 0 && inputDate.trim().length === 0:
        setNameValid(false);
        setDateValid(false);
        setError({
          title: "incorrect input: empty fields",
          message: "Form fields 'Name' & 'Date' cannot be empty",
        });
        break;

      case inputName.trim().length === 0:
        setNameValid(false);
        setError({
          title: "incorrect input: Fied 'Name' to short",
          message: "Fied 'Name' cannot be empty",
        });
        break;

      case inputDate.trim().length === 0:
        setDateValid(false);
        setError({
          title: "incorrect input: Fied 'Date' to short",
          message: "Fied 'Date' cannot be empty",
        });
        break;
      case new Date(inputDate).getTime() <= minDate.getTime():
        setDateValid(false);
        setError({
          title: "incorrect input: Fied 'Date' is outdated",
          message: "Сhoose a date from 2020",
        });
        break;
      case inputAmount.trim().length === 0:
        setCostValid(false);
        setError({
          title: "incorrect input: Fied 'Cost' to short",
          message: "Fied 'Cost' cannot be empty",
        });
        break;

      case +inputAmount < 1:
        setCostValid(false);
        setError({
          title: "incorrect input",
          message: "Fied 'Amount' cannot be less than 1",
        });
        break;

      default:
        sendCost();
        break;
    }
  }

  const SubmitHandler = (event) => {
    event.preventDefault();
    validateForm();
  };

  const CancelHandler = () => {
    setInputName("");
    setInputAmount("");
    setInputDate("");
    setInputIsOpened(false);
  };

  const AddNewExpenseHandler = () => {
    setInputIsOpened(true);
  };

  if (inputIsOpened) {
    return (
      <div>
        {error && (
          <ErrorModal
            onCloseModal={ErrorHandler}
            title={error.title}
            message={error.message}
          />
        )}
        <form onSubmit={SubmitHandler}>
          <div className={styles["form-controls"]}>
            <Input
              label="Name"
              type="text"
              isValid={isNameValid}
              value={inputName}
              onChange={NameChangeHandler}
            />
            <Input
              label="Cost"
              type="number"
              min="0.01"
              step="0.01"
              isValid={isCostValid}
              value={inputAmount}
              onChange={AmountChangeHandler}
            />
            <Input
              label="Date"
              type="date"
              isValid={isDateValid}
              value={inputDate}
              onChange={DateChangeHandler}
              // didn`t work
              max={curDate}
              step="2023-12-31"
            />
          </div>
          <div className={styles["new-cost-actions"]}>
            {!isPending && <Button type="submit">Add expense</Button>}
            {isPending && (
              <Button type="submit" disabled>
                Adding expense...
              </Button>
            )}
            <Button type="button" onClick={CancelHandler} value={inputIsOpened}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <button type="button" onClick={AddNewExpenseHandler}>
        Add new expense
      </button>
    </div>
  );
}
export default CostForm;
