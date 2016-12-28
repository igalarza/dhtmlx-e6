
import { SimpleLayout } from './layout/SimpleLayout';
import { TwoColumnsLayout } from './layout/TwoColumnsLayout';



var simpleLayout = new SimpleLayout(document.body);
var twoColumns = new TwoColumnsLayout(simpleLayout.getCell());