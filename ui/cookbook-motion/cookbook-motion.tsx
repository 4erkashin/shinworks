"use client";

import { Button } from "@base-ui/react/button";
import * as stylex from "@stylexjs/stylex";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { motionTime } from "../../tokens/generated/motion";
import { colors, fonts, spacing } from "../../tokens/generated/tokens.stylex";

const startingItems = [1, 2, 3];

export function CookbookMotion() {
  const [items, setItems] = useState(startingItems);
  const [nextId, setNextId] = useState(4);

  function addRow() {
    setItems((current) => [...current, nextId]);
    setNextId((id) => id + 1);
  }

  function removeRow(id: number) {
    setItems((current) => current.filter((item) => item !== id));
  }

  return (
    <div {...stylex.props(styles.box)}>
      <Button
        nativeButton
        onClick={addRow}
        type="button"
        {...stylex.props(styles.button)}
      >
        Add row
      </Button>
      {/* Keeps row layout animation from moving the Add button. */}
      <motion.ul layoutRoot {...stylex.props(styles.list)}>
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((id) => (
            <motion.li
              animate={{ height: "auto", opacity: 1 }}
              exit={{ opacity: 0, y: 8 }}
              initial={{ height: 0, opacity: 0 }}
              key={id}
              layout="position"
              layoutId={`cookbook-motion-${id}`}
              style={{ overflow: "hidden" }}
              transition={{
                height: { type: "spring" },
                layout: { type: "spring" },
                opacity: {
                  duration: motionTime.fade,
                  ease: motionTime.easingStandard,
                },
                y: {
                  duration: motionTime.move,
                  ease: motionTime.easingStandard,
                },
              }}
            >
              <div {...stylex.props(styles.row)}>
                <span>Row {id}</span>
                <Button
                  nativeButton
                  onClick={() => removeRow(id)}
                  type="button"
                  {...stylex.props(styles.button)}
                >
                  Remove
                </Button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}

const styles = stylex.create({
  box: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
    padding: spacing.md,
    margin: 0,
    fontFamily: fonts.sans,
    fontSize: "1rem",
    color: colors.foreground,
    backgroundColor: colors.background,
    borderColor: colors.foreground,
    borderStyle: "solid",
    borderWidth: spacing.px,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
    padding: 0,
    margin: 0,
    listStyleType: "none",
  },
  row: {
    display: "flex",
    gap: spacing.sm,
    justifyContent: "space-between",
    padding: spacing.sm,
  },
  button: {
    paddingBlock: spacing.xs,
    paddingInline: spacing.sm,
    font: "inherit",
    lineHeight: 1,
    color: colors.foreground,
    cursor: "pointer",
    outlineWidth: spacing.px,
    outlineStyle: "solid",
    outlineColor: {
      default: "transparent",
      ":focus-visible": colors.foreground,
    },
    outlineOffset: spacing.xxs,
    backgroundColor: "transparent",
    borderColor: colors.foreground,
    borderStyle: "solid",
    borderWidth: spacing.px,
  },
});
