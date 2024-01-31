import React from "react";
import styles from "./cell.module.css";

const Cell = React.memo(({ isAlive, onClick }) => (
  <div className={styles.cell} style={{ backgroundColor: isAlive ? 'grey' : 'white' }} onClick={onClick} />
));

Cell.displayName = 'Cell';

export default Cell;
