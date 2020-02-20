const AWS = require('aws-sdk');
// gm : 이미지 조작을 위한 패키지.imageMagick 방식으로 이미지를 리사이징
const gm = require('gm').subClass({ imageMagick: true });

const s3 = new AWS.S3();

// handler가 Lambda 호출 시 실행되는 함수
// event : 호출 상황에 대한 정보
// context : 실행되는 함수 환경에 대한 정보
// callback : 함수가 완료되었는지 람다에 알려줌
// callback의 첫번째인자 : 에러 여부, 두번째인자 : 설명을 의미
exports.handler = (event, context, callback) => {

  const Bucket = event.Records[0].s3.bucket.name; // 버킷이름
  const Key = event.Records[0].s3.object.key; // 파일경로
  const filename = Key.split('/')[Key.split('/').length - 1];
  const ext = Key.split('.')[Key.split('.').length - 1]; // 확장자

  console.log('Key', Key, filename, ext);

  // getObject로 버킷으로 부터 파일을 불러옴
  // data.body에 파일 버퍼가 담겨있음
  s3.getObject({ Bucket, Key }, (err, data) => {
    if (err) {
      console.error(err);
      return callback(err);
    }
    console.log('getObj', data);

    // 파일버퍼를 넣고, 크기지정
    return gm(Buffer.from(data.Body))
      .resize(800, 800)
      .stream(function (err, stdout, stderr) { // 스트림에 출력하는
        if (err) {
          console.error(err);
          return callback(err);
        }
        const chunks = [];  // 스트림 청크를 모으는위한 배열
        stdout.on('data', function (chunk) {
          console.log('pushed');
          chunks.push(chunk);  // 청크를 모으는
        });
        stdout.on('end', function () {
          console.log('end');
          const buffer = Buffer.concat(chunks);  // 마지막까지 모아서 저축 경우에 결합하여 버퍼로 내보낼
          console.log('buffer', buffer);

          // 리사이징된 이미지를 thumb폴더 아래에 저장
          s3.putObject({
            Bucket,
            Key: `thumb/${filename}`,
            Body: buffer,
          }, function (err, data) {  // S3에 내보낼
            if (err) {
              console.error(err);
              return callback(err);
            }
            console.log('put');
            return callback(null, `thumb/${filename}`);
          });
        });
      });
  });
}