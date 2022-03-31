export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const mapFields = (label, object) => {
	const keys = Object.keys(object);
	return keys.reduce((arr, k) => {
		if (typeof object[k] === 'object') {
			const keys = Object.keys(object[k]).map(kk => ({
				isTitle: false,
				source: `${label}.${k}.${kk}`,
				label: capitalizeFirstLetter(kk)
			}));
			return [...arr, {
				isTitle: true,
				source: `${label}.${k}`,
				label: capitalizeFirstLetter(k)
			},...keys];
		}
		return [...arr, {
			isTitle: false,
			source: `${label}.${k}`,
			isJson: k === 'body',
			label: capitalizeFirstLetter(k)
		}];
	}, []);
};