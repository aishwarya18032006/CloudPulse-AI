export const CLOUD_ERROR_MESSAGES = {
  aws: "Please provide valid AWS credentials.",
  azure: "Please provide all Azure credentials.",
  gcp: "Please provide valid GCP credentials.",
};

const isEmpty = (value) => !value || !String(value).trim();

export const validateCloudCredentials = (provider, form = {}) => {
  const fieldErrors = {};

  if (provider === "aws") {
    if (isEmpty(form.accessKey)) fieldErrors.accessKey = true;
    if (isEmpty(form.secretKey)) fieldErrors.secretKey = true;
  } else if (provider === "azure") {
    if (isEmpty(form.subscriptionId)) fieldErrors.subscriptionId = true;
    if (isEmpty(form.tenantId)) fieldErrors.tenantId = true;
    if (isEmpty(form.clientId)) fieldErrors.clientId = true;
    if (isEmpty(form.clientSecret)) fieldErrors.clientSecret = true;
  } else if (provider === "gcp") {
    if (isEmpty(form.projectId)) fieldErrors.projectId = true;
    if (isEmpty(form.keyFile)) fieldErrors.keyFile = true;
  }

  const valid = Object.keys(fieldErrors).length === 0;
  return {
    valid,
    fieldErrors,
    message: valid ? "" : CLOUD_ERROR_MESSAGES[provider] || "Please provide valid credentials.",
  };
};

export const hasCloudCredentials = (provider, credentials) => {
  if (!provider || provider === "demo") return provider === "demo";
  return validateCloudCredentials(provider, credentials).valid;
};
