var getDateKey = function (date) {
	return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}

window.Agenda = React.createClass({
	renderEvent: function(e){
		return <span>{e.title}</span>
	},
	renderRowDate: function(col){
		return (
			<div key={col.start.toString()} className="agenda__cell agenda__cell--date">
				{col.events.map(this.renderEvent)}
			</div>
		)
	},
	renderRow: function (row) {
		return (
			<div key={row.step} className="agenda__row">
				{this.renderStepHeader(row)}
				{row.cols.map(this.renderRowDate)}
			</div>
		)
	},
	renderStepHeader: function (row) {
		return (
			<div key={row.step} className="agenda__cell agenda__cell--step">
				{row.hour + ':' + row.minutes}
			</div>
		)
	},
	render: function () {
		var eventsByDate = (this.props.events || []).reduce(function (accumulated, current) {
			var key = getDateKey(current.start);
			if (!accumulated[key])
				accumulated[key] = [];
			accumulated[key].push(current);
			return accumulated;
		}, {});

		var now = new Date();
		var dates = [];
		for (var i = 0; i < 3; i++)
			dates.push(new Date(now.getFullYear(), now.getMonth(), now.getDate() + i));

		var rows = [];
		for (var i = 0; i <= 48; i++) {
			var hour = Math.floor(i / 2); 
			var minutes = i % 2 * 30;
			var row = {
				step: i,
				hour: hour,
				minutes: minutes,
				cols: dates.map(function (date) {
					var events = eventsByDate[getDateKey(date)];
					var spanStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour,minutes);
					var spanEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour,minutes + 30 /*step diff*/);
					return {
						start: spanStart,
						events: (events || []).filter(function (e) {
							return e.start >= spanStart && e.start < spanEnd;
						})
					}
				})
			};
			rows.push(row);
		}

		return (
			<div className="agenda">
				<h1>Agenda</h1>
				<div style={{display: 'table'}}>
					<div className="agenda__row">
						<div className="agenda__cell"></div>
						{dates.map(function(date){ return <div className="agenda__cell">{date.toString()}</div>;})}
					</div>
					{rows.map(this.renderRow)}
				</div>
			</div>
		);
	}
});