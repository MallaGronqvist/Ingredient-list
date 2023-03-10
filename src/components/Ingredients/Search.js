import React, { useState, useEffect, useRef } from "react";

import Card from "../UI/Card";
import "./Search.css";

const Search = React.memo((props) => {
  const { onLoadIngredients } = props;
  const [enteredFilter, setEnteredFilter] = useState("");
  const inputRef = useRef();

  useEffect(() => {
    // send request if user pauses typing for 500 msecs.
    // enteredFilter is in the closure of this method,
    // compare that value to the current value.
    const timer = setTimeout(() => {
      if (enteredFilter === inputRef.current.value) {
        const query =
        enteredFilter.length === 0
          ? ""
          : `?orderBy="title"&equalTo="${enteredFilter}"`;
      fetch(
        "https://react-http-6016b-default-rtdb.europe-west1.firebasedatabase.app/ingredients.json" +
          query
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
          onLoadIngredients(loadedIngredients);
        });
      }
      
    }, 500);
    // clean up function that runs before useEffect is executed next time.
    return () => {
      clearTimeout(timer);
    };
  }, [enteredFilter, onLoadIngredients, inputRef]);

  return (
    <section className="search">
      <Card>
        <div className="search-input">
          <label>Filter by Title</label>
          <input
          ref={inputRef}
            type="text"
            value={enteredFilter}
            onChange={(event) => setEnteredFilter(event.target.value)}
          />
        </div>
      </Card>
    </section>
  );
});

export default Search;
