import app from "../../app/[locale]/messages/ru.json";
import errorWidget from "../../features/error-widget/messages/ru.json";
import theme from "../../features/theme-switcher/messages/ru.json";
import cookbook from "../../ui/cookbook-intl/messages/ru.json";

// Same owners as en.ts, for Russian.
const messages = {
  ...cookbook,
  ...app,
  ...errorWidget,
  ...theme,
};

export default messages;
