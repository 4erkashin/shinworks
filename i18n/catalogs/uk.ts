import app from "../../app/[locale]/messages/uk.json";
import errorWidget from "../../features/error-widget/messages/uk.json";
import theme from "../../features/theme-switcher/messages/uk.json";
import cookbook from "../../ui/cookbook-intl/messages/uk.json";

// Same owners as en.ts, for Ukrainian.
const messages = {
  ...cookbook,
  ...app,
  ...errorWidget,
  ...theme,
};

export default messages;
