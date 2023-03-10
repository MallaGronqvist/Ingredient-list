import React, { useReducer, useEffect, useCallback, useMemo } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import Search from "./Search";
import ErrorModal from "../UI/ErrorModal";

// Reducer gets the old state automatically as its first argument.
const ingredientReducer = (currentIngredients, action) => {
  // What we return here replaces the old state.
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...currentIngredients, action.ingredient];
    case "DELETE":
      return currentIngredients.filter((ing) => ing.id !== action.id);
    default:
      throw new Error("Should not get there!");
  }
};

const httpReducer = (curHttpState, action) => {
  switch (action.type) {
    case 'SEND':
      return { loading: true, error: null };
    case 'RESPONSE':
      return { ...curHttpState, loading: false };
    case 'ERROR':
      return { loading: false, error: action.errorMessage }
      case 'CLEAR':
        return { ...curHttpState, error: null };
      default: throw new Error('Should not be reached!');
  }
}

function Ingredients() {
  // Second argument is the initial state.
  const [ingredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {loading:false, error: null})
 // const [isLoading, setIsLoading] = useState(false);
 // const [error, setError] = useState();
  /*
  useEffect(() => {
    fetch(
      "https://react-http-6016b-default-rtdb.europe-west1.firebasedatabase.app/ingredients.json"
    )
      .then((response) => response.json())
      .then((responseData) => {
        const loadedIngredients = [];
        for (const key in responseData) {
          loadedIngredients.push({
            id: key,
            title: responseData[key].title,
            amount: responseData[key].amount,
          });
        }
        setIngredients(loadedIngredients);
      });
  }, []);
*/
  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    // setIngredients(filteredIngredients);
    dispatch({ type: "SET", ingredients: filteredIngredients });
  }, []);

  const addIngredientHandler = useCallback((ingredient) => {
    dispatchHttp({type: 'SEND'});
    fetch(
      "https://react-http-6016b-default-rtdb.europe-west1.firebasedatabase.app/ingredients.json",
      {
        method: "POST",
        body: JSON.stringify(ingredient),
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => {
        dispatchHttp({type: 'RESPONSE'});
        return response.json();
      })
      .then((responseData) => {
        /*
        setIngredients((prevIngredients) => [
          ...prevIngredients,
          { id: responseData.name, ...ingredient },
        ]);
        */
        dispatch({
          type: "ADD",
          ingredient: { id: responseData.name, ...ingredient },
        });
      })
  }, []);

  const removeIngredientHandler = useCallback((id) => {
    dispatchHttp({type: 'SEND'});
    fetch(
      `https://react-http-6016b-default-rtdb.europe-west1.firebasedatabase.app/ingredients/${id}.json`,
      {
        method: "DELETE",
      }
    )
      .then((response) => {
        dispatchHttp({type: 'RESPONSE'});
       // setIngredients((prevIngredients) =>
       //   prevIngredients.filter((ingredient) => ingredient.id !== id)
       // );
       dispatch({type: 'DELETE', id: id});
      })
      .catch((error) => {
          dispatchHttp({type: 'ERROR', errorMessage: 'Something went wrong!'})
      });
  }, []);

  const clearError = useCallback(() => {
    dispatch({type: 'CLEAR'});
  }, []);

  const ingredientList = useMemo(() => {
    return (
    <IngredientList
          ingredients={ingredients}
          onRemoveItem={removeIngredientHandler}
        />
    );
  }, [ingredients, removeIngredientHandler]);

  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
