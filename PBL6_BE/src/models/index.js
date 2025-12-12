import Sequelize from "sequelize";
import dbConfig from "../config/database.js";
import UserModel from "./userModel.js";
import AlertModel from "./alertModel.js";
import AlertEvidenceModel from "./alertEvidenceModel.js";

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
  }
);

const User = UserModel(sequelize, Sequelize.DataTypes);
const Alert = AlertModel(sequelize, Sequelize.DataTypes);
const AlertEvidence = AlertEvidenceModel(sequelize, Sequelize.DataTypes);

// relationships
User.hasMany(Alert, { foreignKey: "userID" });
Alert.belongsTo(User, { foreignKey: "userID" });

Alert.hasMany(AlertEvidence, { foreignKey: "alertID", as: "evidences" });
AlertEvidence.belongsTo(Alert, { foreignKey: "alertID", as: "alert" });

export { sequelize, User, Alert, AlertEvidence };
export default { sequelize, User, Alert, AlertEvidence };
